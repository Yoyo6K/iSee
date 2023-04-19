const multer = require("multer");

const destLocal = process.env.DEST_LOCAL;
const destServer = process.env.DEST_SERVER;

// Configurer l'upload de miniatures
const thumbnailUpload = multer({
  dest: destLocal + "/thumbnails",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo en octets
}).single("thumbnail");

// Configurer l'upload de vidéos
const videoUpload = multer({
  dest: destLocal + "/videos",
  limits: { fileSize: 70 * 1024 * 1024 }, // 70 Mo en octets
}).single("video");

const fileUpload = (req, res, next) => {
  // upload the thumbnail first
  thumbnailUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred, handle it
      return next(err);
    } else if (err) {
      // Other error occurred, handle it
      return next(err);
    }

    // access the uploaded thumbnail
    const thumbnail = req.file;
  });
  // upload the video next
  videoUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred, handle it
      return next(err);
    } else if (err) {
      // Other error occurred, handle it
      return next(err);
    }

    // access the uploaded video
    const video = req.file;

    // handle the uploaded files as needed
    // ...
  });

  next();
};

module.exports = fileUpload;
