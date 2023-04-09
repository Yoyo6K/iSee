const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoModel = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Video', videoModel);