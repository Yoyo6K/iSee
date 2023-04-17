const VideoStates = require("../models/videoStatesModel");

exports.getAllVideoStates = async (req, res) => {
  try {
    const states = await VideoStates.find();
    res.status(200).send(states);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all videos states" });
  }
};
