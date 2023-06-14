const express = require("express");
const router = express.Router();
const { isAuth, checkAuthStatus } = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllVideos,
  getAllVideosAdmin,
  getVideo,
  getUserVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
  incrementViewCount,
  searchVideos,
  likeVideo,
  dislikeVideo,
  changeVideoState,
  adminBlockVideo,
  adminUnblockVideo,
  adminDeleteVideo,
} = require("../controllers/videoController");
const fileUpload = require("../middleware/fileUpload");

router.get("/getAll", getAllVideos);

router.get("/getAllAdmin", isAuth, getAllVideosAdmin);

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

router.put("/admin/block/:videoId", isAuth, isAdmin, adminBlockVideo);
router.put("/admin/unblock/:videoId", isAuth, isAdmin, adminUnblockVideo);

router.put("/addView/:id", incrementViewCount);

router.put("/update/:videoId", isAuth, updateVideo);

router.delete("/delete/:videoId", isAuth, deleteVideo);

router.delete("/admin/delete/:videoId", isAuth, isAdmin, adminDeleteVideo);

router.get("/:id", getVideo);

module.exports = router;
