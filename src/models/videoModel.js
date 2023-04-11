const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoModel = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
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
  thumbnail: {
    type: String,
  },
  nb_vue: {
    type: Number,
    default: 0,
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: 'VideoStatus',
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