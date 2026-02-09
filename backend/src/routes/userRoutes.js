const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getCreditScore,
  getUserStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/credit-score', protect, getCreditScore);
router.get('/stats', protect, getUserStats);

module.exports = router;