const Video = require("../models/videoModel");
const User = require("../models/userModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const emailConfig = require("../../config/Mailer");

const EnumVideo = {
  Private: "Private",
  Public: "Public",
  Unlisted: "Unlisted",
  Blocked: "Blocked",
};

exports.getNbUser = async (req, res) => {
  try {
    const nbUsers = await User.countDocuments();
    res.status(200).json({ nbUsers: nbUsers });
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur s'est produite lors du calcul du nombre d'utilisateurs.",
    });
  }
};

exports.getNbVideoUpload = async (req, res) => {
  try {
    const nbVideos = await Video.countDocuments();
    res.status(200).json({ nbVideos: nbVideos });
  } catch (error) {
    res.status(500).json({
      error: "Une erreur s'est produite lors du calcul du nombre de vidéos.",
    });
  }
};

exports.getSizeVideoUpload = async (req, res) => {
  try {
    const totalSize = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
        },
      },
    ]);

    res.status(200).json({ totalSize: totalSize[0].totalSize });
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur s'est produite lors du calcul de la taille totale des vidéos.",
    });
  }
};

exports.getTableViews = async (req, res) => {
  try {
    const duration = req.query.duration;
    const referenceDate = getReferenceDate(duration);
    const videos = await Video.find();
    const viewsByDate = {};

    videos.forEach((video) => {
      video.views.forEach((view) => {
        if (view.date >= referenceDate) {
          const date = view.date.toISOString().split("T")[0];
          if (viewsByDate[date]) {
            viewsByDate[date].count += view.count;
          } else {
            viewsByDate[date] = { date: view.date, count: view.count };
          }
        }
      });
    });

    // Récupérer les jours de la durée spécifiée
    const dates = getDatesInRange(referenceDate, new Date());

    // Ajouter les dates sans vue
    dates.forEach((date) => {
      const dateString = date.toISOString().split("T")[0];
      if (!viewsByDate[dateString]) {
        viewsByDate[dateString] = { date: date, count: 0 };
      }
    });

    const sortedViews = Object.values(viewsByDate).sort(
      (a, b) => a.date - b.date
    );
    res.status(200).json({ viewsByDate: sortedViews });
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur s'est produite lors du calcul du nombre total de vues.",
    });
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function getReferenceDate(duration) {
  const currentDate = new Date();

  if (duration === "7days") {
    return new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (duration === "30days") {
    return new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (duration === "3months") {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 3,
      currentDate.getDate()
    ); // 3 mois en arrière
  } else if (duration === "year") {
    return new Date(currentDate.getFullYear(), 0, 1);
  } else {
    return currentDate;
  }
}

exports.banUser = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ error: "Only admins can ban users" });
  }

  const { userId, banUntil, banReason } = req.body;

  if (!userId || !banUntil) {
    return res.status(400).send({ error: "Missing userId or banUntil" });
  }

  if (!banReason) {
    return res.status(400).send({ error: "Missing banReason" });
  }

  const banDate = new Date(banUntil);
  if (isNaN(banDate) || banDate < new Date()) {
    return res
      .status(400)
      .send({ error: "banUntil must be a valid date in the future" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    await User.findByIdAndUpdate(userId, { banUntil, banReason });

    await Video.updateMany({ ownerId: userId }, { state: EnumVideo.Blocked });

    res.send({ message: "User has been banned successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ error: "Only admins can unban users" });
  }

  const { userId } = req.params;

  try {
    // Mettre à jour l'utilisateur avec la date de fin du bannissement à null
    await User.findByIdAndUpdate(userId, { banUntil: null, banReason: null });
    await Video.updateMany({ ownerId: userId }, { state: EnumVideo.Private });

    res.send({ message: "User has been unbanned successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error unbanning user" });
  }
};

exports.resendMailVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)

    const token = crypto.randomBytes(64).toString("base64");

    await User.findByIdAndUpdate(userId, {
      token: token,
    });

    let transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });

    let mailOptions = {
      from: "no-reply@iseevision.fr",
      to: user.email,
      subject: "Isee mail verification request",
      html: emailConfig.getHtml(encodeURIComponent(token), user.username),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
      } else {
        console.log(
          "E-mail envoyé avec succès. Réponse du serveur :",
          info.response
        );
      }
    });

    res.send({
      // xsrfToken: xsrfToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
    res.send(200).send({ message: `A verification mail has been sent` });
  } catch (error) {
    console.error(error);
  }
};
