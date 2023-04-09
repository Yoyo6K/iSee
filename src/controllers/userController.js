const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuth = require('../middleware/isAuth');

router.get('/profile', isAuth, userController.getProfile);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/update', isAuth, userController.updateProfile);
router.delete('/delete', isAuth, userController.deleteAccount);

module.exports = router;