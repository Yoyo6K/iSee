const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LivechatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Videos',
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
});

module.exports = mongoose.model('Livechats', LivechatSchema);