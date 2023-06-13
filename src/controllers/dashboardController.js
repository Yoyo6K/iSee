const Video = require("../models/videoModel");
const User = require("../models/userModel");

exports.getNbUser = async (req, res) => {
  try {
    const nbUsers = await User.countDocuments();
    res.status(200).json({ nbUsers: nbUsers });
  } catch (error) {
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
          totalSize: { $sum: "$size" }
        }
      }
    ]);

    res.status(200).json({ totalSize: totalSize[0].totalSize });
  } catch (error) {
    res.status(500).json({ error: 'Une erreur s\'est produite lors du calcul de la taille totale des vidéos.' });
  }
}