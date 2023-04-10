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
} = require("../controllers/videoController");

router.get("/", getAllVideos);

router.get("/:id", getVideo);

router.post("/", uploadVideo);

router.put("/:id", updateVideo);

router.delete("/:id", deleteVideo);

module.exports = router;