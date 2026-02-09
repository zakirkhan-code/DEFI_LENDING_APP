const { ethers } = require('ethers');
const {
  lendingPlatformContract,
  loanTokenContract,
  creditScoreContract,
  provider,
} = require('../config/blockchain');
const LoanRequest = require('../models/LoanRequest');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getActiveLoanRequests = async (req, res, next) => {
  try {

    const activeRequestIds = await lendingPlatformContract.getActiveLoanRequests();

    const requests = [];

    for (let i = 0; i < activeRequestIds.length; i++) {
      const requestId = Number(activeRequestIds[i]);
      const requestDetails = await lendingPlatformContract.getRequestDetails(requestId);

      const borrowerUser = await User.findOne({
        walletAddress: requestDetails.borrower.toLowerCase(),
      });

      requests.push({
        requestId,
        borrower: requestDetails.borrower,
        borrowerName: borrowerUser ? borrowerUser.name : 'Unknown',
        requestedAmount: ethers.formatEther(requestDetails.requestedAmount),
        collateralAmount: ethers.formatEther(requestDetails.collateralAmount),
        interestRate: Number(requestDetails.interestRate) / 100,
        duration: Number(requestDetails.duration),
        isFunded: requestDetails.isFunded,
        isCancelled: requestDetails.isCancelled,
      });
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoanDetails = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    const loanDetails = await lendingPlatformContract.getLoanDetails(loanId);

    const repaymentDetails = await lendingPlatformContract.calculateRepayment(loanId);

    // Get user info
    const borrowerUser = await User.findOne({
      walletAddress: loanDetails.borrower.toLowerCase(),
    });
    const lenderUser = await User.findOne({
      walletAddress: loanDetails.lender.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      loan: {
        loanId,
        borrower: loanDetails.borrower,
        borrowerName: borrowerUser ? borrowerUser.name : 'Unknown',
        lender: loanDetails.lender,
        lenderName: lenderUser ? lenderUser.name : 'Unknown',
        loanAmount: ethers.formatEther(loanDetails.loanAmount),
        collateralAmount: ethers.formatEther(loanDetails.collateralAmount),
        interestRate: Number(loanDetails.interestRate) / 100,
        endTime: Number(loanDetails.endTime),
        isActive: loanDetails.isActive,
        isRepaid: loanDetails.isRepaid,
        isDefaulted: loanDetails.isDefaulted,
        repayment: {
          total: ethers.formatEther(repaymentDetails.totalRepayment),
          principal: ethers.formatEther(repaymentDetails.principal),
          interest: ethers.formatEther(repaymentDetails.interest),
          platformFee: ethers.formatEther(repaymentDetails.platformFeeAmount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserLoans = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }

    const loanIds = await lendingPlatformContract.getUserLoans(user.walletAddress);

    const loans = [];

    for (let i = 0; i < loanIds.length; i++) {
      const loanId = Number(loanIds[i]);
      const loanDetails = await lendingPlatformContract.getLoanDetails(loanId);

      const lenderUser = await User.findOne({
        walletAddress: loanDetails.lender.toLowerCase(),
      });

      loans.push({
        loanId,
        lender: loanDetails.lender,
        lenderName: lenderUser ? lenderUser.name : 'Unknown',
        loanAmount: ethers.formatEther(loanDetails.loanAmount),
        collateralAmount: ethers.formatEther(loanDetails.collateralAmount),
        interestRate: Number(loanDetails.interestRate) / 100,
        endTime: Number(loanDetails.endTime),
        isActive: loanDetails.isActive,
        isRepaid: loanDetails.isRepaid,
        isDefaulted: loanDetails.isDefaulted,
      });
    }

    res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserLendingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }

    const loanIds = await lendingPlatformContract.getUserLendingHistory(user.walletAddress);

    const loans = [];

    for (let i = 0; i < loanIds.length; i++) {
      const loanId = Number(loanIds[i]);
      const loanDetails = await lendingPlatformContract.getLoanDetails(loanId);

      // Get borrower info
      const borrowerUser = await User.findOne({
        walletAddress: loanDetails.borrower.toLowerCase(),
      });

      loans.push({
        loanId,
        borrower: loanDetails.borrower,
        borrowerName: borrowerUser ? borrowerUser.name : 'Unknown',
        loanAmount: ethers.formatEther(loanDetails.loanAmount),
        collateralAmount: ethers.formatEther(loanDetails.collateralAmount),
        interestRate: Number(loanDetails.interestRate) / 100,
        endTime: Number(loanDetails.endTime),
        isActive: loanDetails.isActive,
        isRepaid: loanDetails.isRepaid,
        isDefaulted: loanDetails.isDefaulted,
      });
    }

    res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }

    const requestIds = await lendingPlatformContract.getUserRequests(user.walletAddress);

    const requests = [];

    for (let i = 0; i < requestIds.length; i++) {
      const requestId = Number(requestIds[i]);
      const requestDetails = await lendingPlatformContract.getRequestDetails(requestId);

      requests.push({
        requestId,
        requestedAmount: ethers.formatEther(requestDetails.requestedAmount),
        collateralAmount: ethers.formatEther(requestDetails.collateralAmount),
        interestRate: Number(requestDetails.interestRate) / 100,
        duration: Number(requestDetails.duration),
        isFunded: requestDetails.isFunded,
        isCancelled: requestDetails.isCancelled,
      });
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformStats = async (req, res, next) => {
  try {
    const loanCounter = await lendingPlatformContract.loanCounter();
    const requestCounter = await lendingPlatformContract.requestCounter();
    const platformFee = await lendingPlatformContract.platformFee();
    const minCreditScore = await lendingPlatformContract.minCreditScore();

    const totalSupply = await loanTokenContract.totalSupply();

    res.status(200).json({
      success: true,
      stats: {
        totalLoans: Number(loanCounter),
        totalRequests: Number(requestCounter),
        platformFee: Number(platformFee) / 100,
        minCreditScore: Number(minCreditScore),
        loanTokenSupply: ethers.formatEther(totalSupply),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTokenBalance = async (req, res, next) => {
  try {
    const { address } = req.params;

    const balance = await loanTokenContract.balanceOf(address);
    const rewardsEarned = await loanTokenContract.rewardsEarned(address);

    res.status(200).json({
      success: true,
      balance: ethers.formatEther(balance),
      rewardsEarned: ethers.formatEther(rewardsEarned),
    });
  } catch (error) {
    next(error);
  }
};

exports.getGasPrice = async (req, res, next) => {
  try {
    const feeData = await provider.getFeeData();

    res.status(200).json({
      success: true,
      gasPrice: {
        standard: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyTransaction = async (req, res, next) => {
  try {
    const { txHash } = req.params;

    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    res.status(200).json({
      success: true,
      transaction: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        gasLimit: tx.gasLimit.toString(),
        nonce: tx.nonce,
        blockNumber: tx.blockNumber,
        confirmations: receipt ? receipt.confirmations : 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};