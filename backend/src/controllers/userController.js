const User = require('../models/User');
const { creditScoreContract } = require('../config/blockchain');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCreditScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }

    const creditScore = await creditScoreContract.getCreditScore(user.walletAddress);
    const creditDetails = await creditScoreContract.getCreditDetails(user.walletAddress);

    await User.findByIdAndUpdate(req.user.id, {
      creditScore: Number(creditScore),
      totalBorrowed: creditDetails.totalBorrowed.toString(),
      totalRepaid: creditDetails.totalRepaid.toString(),
      activeLoans: Number(creditDetails.activeLoans),
    });

    res.status(200).json({
      success: true,
      creditScore: Number(creditScore),
      creditDetails: {
        totalBorrowed: creditDetails.totalBorrowed.toString(),
        totalRepaid: creditDetails.totalRepaid.toString(),
        activeLoans: Number(creditDetails.activeLoans),
        defaultedLoans: Number(creditDetails.defaultedLoans),
        creditScore: Number(creditDetails.creditScore),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const Loan = require('../models/Loan');
    const LoanRequest = require('../models/LoanRequest');

    const user = await User.findById(req.user.id);

    const borrowedLoans = await Loan.countDocuments({ borrower: user.walletAddress });
    const activeBorrowedLoans = await Loan.countDocuments({
      borrower: user.walletAddress,
      isActive: true,
    });

    const lentLoans = await Loan.countDocuments({ lender: user.walletAddress });
    const activeLentLoans = await Loan.countDocuments({
      lender: user.walletAddress,
      isActive: true,
    });

    const totalRequests = await LoanRequest.countDocuments({ borrower: user.walletAddress });
    const activeRequests = await LoanRequest.countDocuments({
      borrower: user.walletAddress,
      isFunded: false,
      isCancelled: false,
    });

    res.status(200).json({
      success: true,
      stats: {
        borrowed: {
          total: borrowedLoans,
          active: activeBorrowedLoans,
        },
        lent: {
          total: lentLoans,
          active: activeLentLoans,
        },
        requests: {
          total: totalRequests,
          active: activeRequests,
        },
        creditScore: user.creditScore,
      },
    });
  } catch (error) {
    next(error);
  }
};