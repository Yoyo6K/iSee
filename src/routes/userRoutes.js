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
} = require("../controllers/userController");

router.get("/getAll", isAuth, isAdmin, getAllUsers);

router.get("/profile", isAuth, profileUsers);
router.get("/checkIsAuth", isAuth, async (req, res) => {
  res.status(200).send({
    user: {
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    },
  });
});

router.post("/login", loginUsers);

router.post("/register", registerUsers);

router.put("/update", isAuth, updateUsers);

router.delete("/delete", isAuth, deleteUsers);

module.exports = router;
