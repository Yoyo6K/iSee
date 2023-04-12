const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const { getAllVideoStates,  addVideoStates } = require("../controllers/videoStatesController");

router.get("/getAll", isAuth, isAdmin, getAllVideoStates);

router.post("/add", isAuth, isAdmin, addVideoStates)


module.exports = router;