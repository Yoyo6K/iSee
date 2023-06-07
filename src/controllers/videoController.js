const Video = require("../models/videoModel");
const mongoose = require("mongoose");
exports.getAllVideos = async (req, res) => {
  try {
    const defaultState = "Public";
    const videos = await Video.find({ status: defaultState });
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all videos" });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const defaultState = "Public";
    const video = await Video.findOne({ _id: req.params.id, state: defaultState });

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    res.status(200).send(video);
  } catch (error) {
    res.status(500).send({ error: "Error fetching video" });
  }
};

exports.incrementViewCount = async (req, res) => {
  try {
    const videoId = req.params.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }
    video.views += 1;

    await video.save();
    res.status(200).send(video);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error incrementing view count" });
  }
};

exports.uploadVideo = async (req, res) => {
  try {

    //const uploadIdSTR = req.uploadId;
    const uploadIdSTR = req.locals.uploadId;

    const videoPath = req.files["video"][0].path
    const thumbnailPath = req.files["thumbnail"][0].path

    console.log("FILE : " + req.files["thumbnail"][0].path);

    const uploadId = mongoose.Types.ObjectId(uploadIdSTR).toString()


    const newVideo = new Video({
      _id: uploadId,
      ownerId: req.user._id,
      thumbnail_path: thumbnailPath,
      video_path: videoPath,
      ...req.body
    });

    const savedVideo = await newVideo.save();
    res.status(201).send(savedVideo);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error uploading video" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    if (video.ownerId.toString() !== userId) {
      return res.status(403).send({ error: "You don't have the permission" });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).send(updatedVideo);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    if (video.ownerId.toString() !== userId || req.user.isAdmin !== true) {
      return res.status(403).send({ error: "You don't have the permission" });
    }

    await Video.findByIdAndDelete(videoId);
    res.status(200).send({ message: "Video deleted" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting video" });
  }
};
