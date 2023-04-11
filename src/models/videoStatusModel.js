const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoStatusSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("VideoStatus", videoStatusSchema);
