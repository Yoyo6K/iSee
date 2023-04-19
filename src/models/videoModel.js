const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoModel = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  video_path: {
    type: String,
    required: true,
  },
  thumbnail_path: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  state: {
    type: String,
    enum: ["Private", "Public", "Hide"],
    required: true,
    default: "Public",
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Videos', videoModel);