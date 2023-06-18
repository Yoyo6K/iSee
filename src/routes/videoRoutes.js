const express = require("express");
const router = express.Router();
const { isAuth, checkAuthStatus } = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const fs = require("fs");
const md5 = require("md5");
const mongoose = require("mongoose");
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
  similarVideo,
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

router.get("/similarVideo/:userId", similarVideo);

router.post("/uploadVideo",isAuth, (req, res) => {
  console.log("upload")
  const destLocal = process.env.INIT_CWD;
  const destServer = process.env.DEST_SERVER;
  const isDevelopment = process.env.NODE_ENV === "development";
  const destination = isDevelopment ? destLocal : destServer;
  const uploadDir = destination + "/videos/";
  const FILE_URL_PATH = process.env.FILE_URL;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    const { name, currentChunkIndex, totalChunks } = req.query;
    const firstChunk = parseInt(currentChunkIndex) === 0;
    const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
    const ext = name.split(".").pop();
    const data = req.body.toString().split(",")[1];
    const buffer = Buffer.from(data, "base64"); // Utilisation de Buffer.from() au lieu de new Buffer()
    const tmpFilename = "tmp_" + md5(name + req.ip) + "." + ext;

    console.log("Uploading : ",currentChunkIndex);

    if (firstChunk && fs.existsSync(uploadDir + tmpFilename)) {
      fs.unlinkSync(uploadDir + tmpFilename);
    }
    fs.appendFileSync(uploadDir + tmpFilename, buffer);

    if (lastChunk) {
      const filename = mongoose.Types.ObjectId();
      const finalFilename = filename + "." + ext; // md5(Date.now()).substr(0, 6) + "." + ext;

      fs.renameSync(uploadDir + tmpFilename, uploadDir + finalFilename);
      console.log("finalFilename : " +finalFilename);
      res.json({
        finalFileName: finalFilename,
        path: uploadDir.replace(destServer, FILE_URL_PATH)
      });
    } else {
      res.json("ok");
    }
  } catch (error) {
    console.error("Erreur lors du traitement de la requête :", error);
    res.status(500).json({
      error: "An erreur occured during upload.",
    });
  }
});

module.exports = router;
