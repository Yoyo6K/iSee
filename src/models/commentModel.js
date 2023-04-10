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
});

module.exports = mongoose.model('Comments', commentModel);