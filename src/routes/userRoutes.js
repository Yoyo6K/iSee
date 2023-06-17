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
  deleteUserByID,
  logoutUsers,
  verificationUsers,
  channelUsers,
  forgetPassword,
  resetPassword,
  resendVerificationEmail,
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
      logo: req.user.logo_path,
      banner: req.user.banner_path,
      expiresAt : req.user.expiresAt
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

router.post("/forgetPassword", forgetPassword);

router.post("/resetPassword/:token", resetPassword);

router.delete("/delete", isAuth, deleteUsers);

router.delete("/delete/:userId", isAuth, isAdmin, deleteUserByID);

router.post("/verification", verificationUsers);

router.post("/resendVerificationEmail", resendVerificationEmail);

module.exports = router;