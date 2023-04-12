const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllUsers,
  profileUsers,
  loginUsers,
  registerUsers,
  updateUsers,
  deleteUsers,
  logoutUsers,
} = require("../controllers/userController");

router.get("/getAll", isAuth, isAdmin, getAllUsers);

router.get("/profile", isAuth, profileUsers);

router.post("/login", loginUsers);

router.post("/register", registerUsers);

router.put("/update", isAuth, updateUsers);

router.delete("/delete", isAuth, deleteUsers);

// router.post('/logout', isAuth, logoutUsers);


module.exports = router;