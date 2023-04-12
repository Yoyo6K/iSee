const VideoStates = require("../models/videoStatesModel");

exports.getAllVideoStates = async (req, res) => {
  try {
    const states = await VideoStates.find();
    res.status(200).send(states);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all videos states" });
  }
};


exports.addVideoStates = async (req, res) => {
  try {
    const { name } = req.body;

    const newState = new VideoStates({name: name});

    const savedState = await newState.save();
    res.status(201).send(savedState);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error when adding State" });
  }
};
