const multer = require("multer");

const destLocal = process.env.INIT_CWD;
const destServer = process.env.DEST_SERVER;

// Configurer l'upload de miniatures
const thumbnailUpload = multer({
  dest: destLocal + "/thumbnails",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo en octets
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Filetype not allowed"));
    }
  },
  onError: function (err, next) {
    return new Error(err);
  },
}).single("thumbnail");

// Configurer l'upload de vidéos
const videoUpload = multer({
  dest: destLocal + "/videos",
  limits: { fileSize: 70 * 1024 * 1024 }, // 70 Mo en octets
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/mov" ||
      file.mimetype == "video/wmv"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Filetype not allowed"));
    }
  },
  onError: function (err, next) {
    return new Error(err);
  },
}).single("video");

// const fileUpload = (req, res, next) => {
//   // upload the thumbnail first
//   thumbnailUpload(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       // Multer error occurred, handle it
//       return next(err);
//     } else if (err) {
//       // Other error occurred, handle it
//       return next(err);
//     }

//     // access the uploaded thumbnail
//     const thumbnail = req.file;
//   }) ;
//   // upload the video next
//   videoUpload(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       // Multer error occurred, handle it
//       return next(err);
//     } else if (err) {
//       // Other error occurred, handle it
//       return next(err);
//     }

//     // access the uploaded video
//     const video = req.file;

//     // handle the uploaded files as needed
//     // ...
//   });

//   next();
// };

module.exports = fileUpload;
