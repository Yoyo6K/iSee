const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllVideos,
  getVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
  incrementViewCount,
  searchVideos
} = require("../controllers/videoController");
const fileUpload = require("../middleware/fileUpload");

router.get("/getAll", getAllVideos);

router.get("/:id", getVideo);

router.get("/search/:query", searchVideos);

router.post(
  "/upload",
  isAuth,
  fileUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router.put('/addView/:id', incrementViewCount);

router.put("/:id", isAuth, updateVideo);

router.delete("/:id", isAuth, isAdmin, deleteVideo);

module.exports = router;