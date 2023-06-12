const express = require("express");
const router = express.Router();
const { isAuth, checkAuthStatus } = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const fileUpload = require("../middleware/fileUpload");
const {
  getAllUsers,
  profileUsers,
  loginUsers,
  registerUsers,
  updateUsers,
  deleteUsers,
  logoutUsers,
  verificationUsers,
  channelUsers,
} = require("../controllers/userController");

router.get("/getAll", isAuth, isAdmin, getAllUsers);

router.get("/channel/:channelName", checkAuthStatus, channelUsers);

router.get("/profile", isAuth, profileUsers);

router.get("/checkIsAuth", isAuth, async (req, res) => {
  res.status(200).send({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      logo: user.logo_path,
      banner: user.banner_path,
    },
  });
});

router.post("/logout", logoutUsers);

router.post("/login", loginUsers);

router.post(
  "/register",
  fileUpload.fields([{ name: "logo", maxCount: 1 }]),
  registerUsers
);

router.put(
  "/update",
  isAuth,
  fileUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateUsers
);

router.delete("/delete", isAuth, deleteUsers);

router.post("/verification", verificationUsers);

module.exports = router;
