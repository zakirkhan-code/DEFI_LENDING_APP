const express = require('express');
const router = express.Router();
const {
  getActiveLoanRequests,
  getLoanDetails,
  getUserLoans,
  getUserLendingHistory,
  getUserRequests,
  getPlatformStats,
  getTokenBalance,
  getGasPrice,
  verifyTransaction,
} = require('../controllers/blockchainController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/loan-requests', getActiveLoanRequests);
router.get('/loans/:loanId', getLoanDetails);
router.get('/stats', getPlatformStats);
router.get('/token-balance/:address', getTokenBalance);
router.get('/gas-price', getGasPrice);
router.get('/transaction/:txHash', verifyTransaction);

// Protected routes
router.get('/my-loans', protect, getUserLoans);
router.get('/my-lending', protect, getUserLendingHistory);
router.get('/my-requests', protect, getUserRequests);

module.exports = router;