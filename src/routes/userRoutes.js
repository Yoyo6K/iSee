const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  userProfile,
  userDisplayAll,
  userRegister,
  userLogin,
  userUpdate,
  userDelete,
} = require("../controllers/userController");

router.get("/allusers", isAuth, userDisplayAll);

router.get("/profile", isAuth, userProfile);

router.post("/register", userRegister);

router.put("/update", isAuth, userUpdate);

router.delete("/delete", isAuth, userDelete);

module.exports = router;