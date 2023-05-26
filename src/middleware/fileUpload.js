const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const destLocal = process.env.INIT_CWD;
const destServer = process.env.DEST_SERVER;


const storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    fs.mkdirSync(destLocal + "/thumbnails", { recursive: true });
    fs.mkdirSync(destLocal + "/videos", { recursive: true });

    if (file.fieldname == "thumbnail")
      cb(null, destLocal + "/thumbnails");
    else if (file.fieldname == "video")
      cb(null, destLocal + "/videos");
    else{
      cb(null, false);
      return cb(new Error("File not allowed"));
    }

  },
  filename: (req,file,cb) => {
    req.locals = req.locals || {}; // Créer l'objet req.locals s'il n'existe pas
    req.locals.uploadId = req.locals.uploadId || mongoose.Types.ObjectId(); // Générer l'UUID si nécessaire

    cb(null, req.locals.uploadId + path.extname(file.originalname));
  }
});


const fileFilter =  (req,file,cb) => {
if (file.fieldname === 'thumbnail') {
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
} else if (file.fieldname === "video") {
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
} else {
  cb(new Error("Invalid file type"));
}
}

const limits = {
  fileSize: {
    video: 70 * 1024 * 1024, // 70 Mo en octets
    image: 10 * 1024 * 1024 // 10 Mo en octets
  },
};


const upload = multer({
  storage : storage,
  fileFilter : fileFilter,
  limits : limits
})


module.exports = upload;
