const express = require("express");
const router = express.Router();
const {isAuth} = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
    getNbUser,
    getNbVideoUpload,
    getSizeVideoUpload,
    getTableViews
  } = require("../controllers/dashboardController");

router.get("/getNbUser", isAuth, isAdmin, getNbUser);

router.get("/getNbVideoUpload", isAuth, isAdmin, getNbVideoUpload);

router.get("/getSizeVideoUpload", isAuth, isAdmin, getSizeVideoUpload);

router.get("/getViewsByDuration", isAuth, isAdmin, getTableViews)

module.exports = router;