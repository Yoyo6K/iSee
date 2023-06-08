const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllVideos,
  getVideo,
  getUserVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
  incrementViewCount,
  searchVideos,
  likeVideo,
  dislikeVideo
} = require("../controllers/videoController");
const fileUpload = require("../middleware/fileUpload");

router.get("/getAll", getAllVideos);

router.get("/user/:userId", isAuth, getUserVideos);

router.get("/search/:query", searchVideos);

router.put("/like/:videoId", isAuth, likeVideo);

router.put("/dislike/:videoId", isAuth, dislikeVideo);

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

router.get("/:id", getVideo);

module.exports = router;