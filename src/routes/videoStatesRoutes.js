const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const { getAllVideoStates } = require("../controllers/videoStatesController");

router.get("/getAll", isAuth, isAdmin, getAllVideoStates);

module.exports = router;