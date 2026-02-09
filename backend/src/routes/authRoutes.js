const express = require('express');
const router = express.Router();
const { register, login, getMe, connectWallet } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/connect-wallet', protect, connectWallet);

module.exports = router;