const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
    getNbUser,
    getNbVideoUpload,
    getSizeVideoUpload,
  } = require("../controllers/dashboardController");

router.get("/getNbUser", isAuth, isAdmin, getNbUser);

router.get("/getNbVideoUpload", isAuth, isAdmin, getNbVideoUpload);

router.get("/getSizeVideoUpload", isAuth, isAdmin, getSizeVideoUpload);

module.exports = router;