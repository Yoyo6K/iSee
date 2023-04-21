const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const multer = require("multer");
const upload = multer();

const {
  getAllVideos,
  getVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/videoController");
const fileUpload = require("../middleware/fileUpload");

router.get("/", getAllVideos);

router.get("/:id", getVideo);

router.post(
  "/upload",
  isAuth,
  upload.fields([{ name: "video" }, { name: "image" }]),uploadVideo
);

router.put("/:id", isAuth, updateVideo);

router.delete("/:id", isAuth, isAdmin, deleteVideo);

module.exports = router;