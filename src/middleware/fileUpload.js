const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const destLocal = process.env.INIT_CWD;
const destServer = process.env.DEST_SERVER;
const isDevelopment = process.env.NODE_ENV === "development";

console.log("destlocal : ", destLocal);
const destination = isDevelopment ? destLocal : destServer;

// Chemin du répertoire à vérifier
const cheminRepertoireMount = `${destServer}/thumbnails`;

// Vérification de l'accessibilité du répertoire
const limits = {
  fileSize: {
    video: 3000 * 1024 * 1024, // 3000 Mo en octets
    image: 10 * 1024 * 1024, // 10 Mo en octets
    logo: 10 * 1024 * 1024, // 10 Mo en octets
    banner: 10 * 1024 * 1024, // 10 Mo en octets
  },
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("destination : ", destination);
    // if (destination === destServer) {
    //   fs.access(cheminRepertoireMount, fs.constants.F_OK, (err) => {
    //     if (err) {
    //       return cb(new Error("Le répertoire n'est pas accessible !"));
    //     } else {
    //       console.log("Le répertoire est accessible");
    //     }
    //   });
    // }

    //Vérification de la création des dossiers
    if (file.fieldname === "thumbnail") {
      fs.mkdirSync(destination + "/thumbnails", {
        recursive: true,
      });
    }

    if (file.fieldname === "video") {
      fs.mkdirSync(destination + "/videos", {
        recursive: true,
      });
    }

    if (file.fieldname == "logo") {
      fs.mkdirSync(`${destination}/users`, {
        recursive: true,
      });
    }

    if (file.fieldname == "banner") {
      fs.mkdirSync(`${destination}/users/banners`, {
        recursive: true,
      });
    }

    if (file.fieldname == "thumbnail") cb(null, `${destination}/thumbnails`);
    else if (file.fieldname == "video") cb(null, `${destination}/videos`);
    else if (file.fieldname == "logo") cb(null, `${destination}/users`);
    else if (file.fieldname == "banner")
      cb(null, `${destination}/users/banners`);
    else {
      cb(null, false);
      return cb(new Error("File not allowed"));
    }

    // Vérification de la taille du fichier
    const fileSizeLimit = limits.fileSize[file.fieldname];
    if (fileSizeLimit && file.size > fileSizeLimit) {
      cb(null, false);
      return cb(new Error("File size limit exceeded"));
    }
  },
  filename: (req, file, cb) => {
    req.locals = req.locals || {}; // Créer l'objet req.locals s'il n'existe pas
    req.locals.uploadId = req.locals.uploadId || mongoose.Types.ObjectId(); // Générer l'UUID si nécessaire

    cb(null, req.locals.uploadId + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "thumbnail" ||
    file.fieldname === "logo" ||
    file.fieldname === "banner"
  ) {
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
};



const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;
