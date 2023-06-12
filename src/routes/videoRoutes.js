const express = require("express");
const router = express.Router();
const {isAuth,checkAuthStatus} = require("../middleware/isAuth");
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
  dislikeVideo,
  changeVideoState
} = require("../controllers/videoController");
const fileUpload = require("../middleware/fileUpload");

router.get("/getAll", getAllVideos);

router.get("/user/:userId", checkAuthStatus, getUserVideos);

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
router.put("/state/:videoId", isAuth, changeVideoState);

router.put('/addView/:id', incrementViewCount);

router.put("/update/:videoId", isAuth, updateVideo);

router.delete("/delete/:videoId", isAuth, deleteVideo);

router.get("/:id", getVideo);

module.exports = router;