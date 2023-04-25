const multer = require("multer");

const destLocal = process.env.INIT_CWD;
const destServer = process.env.DEST_SERVER;

const storage = multer.diskStorage({
  destinations:  (req, file, cb) => {
    if (file.fieldname === "thumbnails")
      cb(null, destLocal + "/thumbnails");
    else if (file.fieldname === "video")
      cb(null, destLocal + "/videos");
    else cb(null, false);
      return cb(new Error("File not allowed"));
  }
});


const fileFilter =  (req,file,cb) => {
  console.log("file : " + file.fieldname);
if (file.fieldname === 'thumbnails') {
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
