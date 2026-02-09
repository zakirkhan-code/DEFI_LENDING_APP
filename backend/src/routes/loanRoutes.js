const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const LoanRequest = require('../models/LoanRequest');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { status, borrower, lender } = req.query;

    let filter = {};

    if (status === 'active') filter.isActive = true;
    if (status === 'repaid') filter.isRepaid = true;
    if (status === 'defaulted') filter.isDefaulted = true;
    if (borrower) filter.borrower = borrower.toLowerCase();
    if (lender) filter.lender = lender.toLowerCase();

    const loans = await Loan.find(filter)
      .populate('borrowerUserId', 'name email')
      .populate('lenderUserId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ loanId: req.params.id })
      .populate('borrowerUserId', 'name email walletAddress')
      .populate('lenderUserId', 'name email walletAddress');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      success: true,
      loan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;