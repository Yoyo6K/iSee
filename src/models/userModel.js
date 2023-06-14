const mongoose = require('mongoose');
const { isEmail } = require('validator');
const Schema = mongoose.Schema

const userModel = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [isEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  logo_path: {
    type: String,
    required: false,
  },
  banner_path: {
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  isValidated: {
    type: Boolean,
    default: false,
  },
  banUntil: {
    type: Date,
    default: null
  },
  banReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    default: "",
  },
  expiresAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Users', userModel);