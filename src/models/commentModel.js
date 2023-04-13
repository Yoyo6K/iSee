const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentModel = new Schema({
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  dislikesCount: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model('Comments', commentModel);