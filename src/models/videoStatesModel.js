const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoStatesSchema = new Schema({
  name: {
    type: String,
    enum: ["Privée", "Public", "Non Répertorié"],
    required: true,
    default: "Public",
  }
});

module.exports = mongoose.model("VideoStates", videoStatesSchema);
