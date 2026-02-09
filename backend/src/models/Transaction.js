const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
    lowercase: true,
  },
  to: {
    type: String,
    lowercase: true,
  },
  type: {
    type: String,
    enum: [
      'LOAN_REQUEST_CREATED',
      'LOAN_FUNDED',
      'LOAN_REPAID',
      'LOAN_DEFAULTED',
      'REQUEST_CANCELLED',
      'REWARD_DISTRIBUTED',
    ],
    required: true,
  },
  amount: {
    type: String,
  },
  loanId: {
    type: Number,
  },
  requestId: {
    type: Number,
  },
  blockNumber: {
    type: Number,
  },
  timestamp: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);