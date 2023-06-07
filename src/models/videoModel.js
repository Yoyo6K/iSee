const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoModel = new Schema({
  _id: {
    type: String,
    required: true,
  },
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
  views: {
    type: Number,
    default: 0,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  dislikesCount: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Users',
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: 'Users',
  }],  
  state: {
    type: String,
    enum: ["Private", "Public", "Hide"],
    required: true,
    default: "Public",
  },
  thumbnail_path: {
    type: String,
    required: false,
  },
  video_path: {
    type: String,
    required: false,
  },
  uploadAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Videos', videoModel);