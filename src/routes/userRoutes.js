const express = require("express");
const router = express.Router();
const {isAuth} = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllUsers,
  profileUsers,
  loginUsers,
  registerUsers,
  updateUsers,
  deleteUsers,
  logoutUsers,
  verificationUsers,
} = require("../controllers/userController");

router.get("/getAll", isAuth, isAdmin, getAllUsers);

router.get("/profile", isAuth, profileUsers);
router.get("/checkIsAuth", isAuth, async (req, res) => {
  res.status(200).send({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    },
  });
});

router.post("/logout", logoutUsers)

router.post("/login", loginUsers);

router.post("/register", registerUsers);

router.put("/update", isAuth, updateUsers);

router.delete("/delete", isAuth, deleteUsers);

router.post("/verification", verificationUsers);

module.exports = router;
