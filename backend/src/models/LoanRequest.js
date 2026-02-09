const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema({
  requestId: {
    type: Number,
    required: true,
    unique: true,
  },
  borrower: {
    type: String,
    required: true,
    lowercase: true,
  },
  borrowerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestedAmount: {
    type: String,
    required: true,
  },
  collateralAmount: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  isFunded: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  transactionHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoanRequest', loanRequestSchema);