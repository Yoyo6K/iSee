const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoStatusSchema = new Schema({
  videoId: {
    type: Schema.Types.ObjectId,
    ref: "Videos",
    required: true,
  },
  libelle: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("VideoStatus", videoStatusSchema);
