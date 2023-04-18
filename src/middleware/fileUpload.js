const multer = require("multer");

const upload = multer({
  dest: "DEST/",
  limits: {
    fileSize: 37500000, // 30 Mo
    // set the maximum file size in bytes
  },
});

const fileUpload = (req, res, next) => {
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred, handle it
      return next(err);
    } else if (err) {
      // Other error occurred, handle it
      return next(err);
    }

    // access the uploaded files
    const thumbnail = req.files["thumbnail"][0];
    const video = req.files["video"][0];

    // check the file sizes
    if (
      thumbnail.size > upload.limits.fileSize ||
      video.size > upload.limits.fileSize
    ) {
      // handle the error
      return res.status(400).send("File size exceeds the maximum limit");
    }

    // handle the uploaded files as needed
    // ...

    next();
  });
};

module.exports = fileUpload;
