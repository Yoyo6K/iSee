const express = require("express");
const router = express.Router();
const {isAuth} = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
    getNbUser,
    getNbVideoUpload,
    getSizeVideoUpload,
    getTableViews,
    banUser,
    unbanUser
  } = require("../controllers/dashboardController");

router.get("/getNbUser", isAuth, isAdmin, getNbUser);

router.get("/getNbVideoUpload", isAuth, isAdmin, getNbVideoUpload);

router.get("/getSizeVideoUpload", isAuth, isAdmin, getSizeVideoUpload);

router.get("/getViewsByDuration", isAuth, isAdmin, getTableViews)

router.post("/banUser", isAuth, isAdmin, banUser);

router.put("/unbanUser/:userId", isAuth, isAdmin, unbanUser);

module.exports = router;