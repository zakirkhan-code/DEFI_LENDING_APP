const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanId: {
    type: Number,
    required: true,
    unique: true,
  },
  requestId: {
    type: Number,
    required: true,
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
  lender: {
    type: String,
    required: true,
    lowercase: true,
  },
  lenderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  loanAmount: {
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
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isRepaid: {
    type: Boolean,
    default: false,
  },
  isDefaulted: {
    type: Boolean,
    default: false,
  },
  repaidAt: {
    type: Date,
  },
  defaultedAt: {
    type: Date,
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

module.exports = mongoose.model('Loan', loanSchema);