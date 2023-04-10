const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoModel = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  titre: {
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
  miniature: {
    type: String,
  },
  nb_vue: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
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

module.exports = mongoose.model('Video', videoModel);