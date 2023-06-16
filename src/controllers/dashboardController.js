const Video = require("../models/videoModel");
const User = require("../models/userModel");

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
          const date = view.date.toISOString().split('T')[0];
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
      const dateString = date.toISOString().split('T')[0];
      if (!viewsByDate[dateString]) {
        viewsByDate[dateString] = { date: date, count: 0 };
      }
    });

    const sortedViews = Object.values(viewsByDate).sort((a, b) => a.date - b.date);
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
