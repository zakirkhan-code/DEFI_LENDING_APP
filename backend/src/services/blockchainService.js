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

class BlockchainService {
  constructor() {
    this.startEventListeners();
  }

  // Start listening to smart contract events
  startEventListeners() {
    console.log('🎧 Starting blockchain event listeners...');

    // Listen to LoanRequested events
    lendingPlatformContract.on(
      'LoanRequested',
      async (requestId, borrower, amount, collateral, interestRate, duration, event) => {
        try {
          console.log(`📝 New Loan Request: #${requestId}`);

          // Find or create user
          let user = await User.findOne({ walletAddress: borrower.toLowerCase() });

          // Save to database
          await LoanRequest.create({
            requestId: Number(requestId),
            borrower: borrower.toLowerCase(),
            borrowerUserId: user ? user._id : null,
            requestedAmount: amount.toString(),
            collateralAmount: collateral.toString(),
            interestRate: Number(interestRate),
            duration: Number(duration),
            transactionHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
          });

          // Save transaction
          await Transaction.create({
            txHash: event.log.transactionHash,
            from: borrower.toLowerCase(),
            type: 'LOAN_REQUEST_CREATED',
            amount: amount.toString(),
            requestId: Number(requestId),
            blockNumber: event.log.blockNumber,
            status: 'confirmed',
          });

          console.log(`✅ Loan Request #${requestId} saved to database`);
        } catch (error) {
          console.error('Error processing LoanRequested event:', error);
        }
      }
    );

    // Listen to LoanFunded events
    lendingPlatformContract.on(
      'LoanFunded',
      async (loanId, requestId, lender, borrower, amount, event) => {
        try {
          console.log(`💰 Loan Funded: #${loanId}`);

          // Get loan details from contract
          const loanDetails = await lendingPlatformContract.getLoanDetails(loanId);

          // Find users
          let borrowerUser = await User.findOne({ walletAddress: borrower.toLowerCase() });
          let lenderUser = await User.findOne({ walletAddress: lender.toLowerCase() });

          // Save loan to database
          await Loan.create({
            loanId: Number(loanId),
            requestId: Number(requestId),
            borrower: borrower.toLowerCase(),
            borrowerUserId: borrowerUser ? borrowerUser._id : null,
            lender: lender.toLowerCase(),
            lenderUserId: lenderUser ? lenderUser._id : null,
            loanAmount: amount.toString(),
            collateralAmount: loanDetails.collateralAmount.toString(),
            interestRate: Number(loanDetails.interestRate),
            duration: Number(loanDetails.duration),
            startTime: Number(loanDetails.startTime),
            endTime: Number(loanDetails.endTime),
            transactionHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
          });

          // Update loan request
          await LoanRequest.findOneAndUpdate(
            { requestId: Number(requestId) },
            { isFunded: true }
          );

          // Update borrower stats
          if (borrowerUser) {
            await User.findByIdAndUpdate(borrowerUser._id, {
              $inc: { activeLoans: 1 },
            });
          }

          // Save transaction
          await Transaction.create({
            txHash: event.log.transactionHash,
            from: lender.toLowerCase(),
            to: borrower.toLowerCase(),
            type: 'LOAN_FUNDED',
            amount: amount.toString(),
            loanId: Number(loanId),
            requestId: Number(requestId),
            blockNumber: event.log.blockNumber,
            status: 'confirmed',
          });

          console.log(`✅ Loan #${loanId} saved to database`);
        } catch (error) {
          console.error('Error processing LoanFunded event:', error);
        }
      }
    );

    // Listen to LoanRepaid events
    lendingPlatformContract.on(
      'LoanRepaid',
      async (loanId, borrower, totalAmount, rewardEarned, event) => {
        try {
          console.log(`✅ Loan Repaid: #${loanId}`);

          // Update loan in database
          await Loan.findOneAndUpdate(
            { loanId: Number(loanId) },
            {
              isActive: false,
              isRepaid: true,
              repaidAt: new Date(),
            }
          );

          // Update borrower stats
          const loan = await Loan.findOne({ loanId: Number(loanId) });
          if (loan && loan.borrowerUserId) {
            const user = await User.findById(loan.borrowerUserId);
            const currentRepaid = parseFloat(user.totalRepaid || '0');
            const loanAmount = parseFloat(ethers.formatEther(loan.loanAmount));

            await User.findByIdAndUpdate(loan.borrowerUserId, {
              $inc: { activeLoans: -1 },
              totalRepaid: (currentRepaid + loanAmount).toString(),
            });
          }

          // Save transaction
          await Transaction.create({
            txHash: event.log.transactionHash,
            from: borrower.toLowerCase(),
            type: 'LOAN_REPAID',
            amount: totalAmount.toString(),
            loanId: Number(loanId),
            blockNumber: event.log.blockNumber,
            status: 'confirmed',
          });

          console.log(`✅ Loan #${loanId} marked as repaid`);
        } catch (error) {
          console.error('Error processing LoanRepaid event:', error);
        }
      }
    );

    // Listen to LoanDefaulted events
    lendingPlatformContract.on('LoanDefaulted', async (loanId, borrower, lender, event) => {
      try {
        console.log(`❌ Loan Defaulted: #${loanId}`);

        // Update loan in database
        await Loan.findOneAndUpdate(
          { loanId: Number(loanId) },
          {
            isActive: false,
            isDefaulted: true,
            defaultedAt: new Date(),
          }
        );

        // Update borrower stats
        const loan = await Loan.findOne({ loanId: Number(loanId) });
        if (loan && loan.borrowerUserId) {
          await User.findByIdAndUpdate(loan.borrowerUserId, {
            $inc: { activeLoans: -1 },
          });
        }

        // Save transaction
        await Transaction.create({
          txHash: event.log.transactionHash,
          from: lender.toLowerCase(),
          type: 'LOAN_DEFAULTED',
          loanId: Number(loanId),
          blockNumber: event.log.blockNumber,
          status: 'confirmed',
        });

        console.log(`✅ Loan #${loanId} marked as defaulted`);
      } catch (error) {
        console.error('Error processing LoanDefaulted event:', error);
      }
    });

    // Listen to RequestCancelled events
    lendingPlatformContract.on('RequestCancelled', async (requestId, borrower, event) => {
      try {
        console.log(`🚫 Request Cancelled: #${requestId}`);

        await LoanRequest.findOneAndUpdate(
          { requestId: Number(requestId) },
          { isCancelled: true }
        );

        await Transaction.create({
          txHash: event.log.transactionHash,
          from: borrower.toLowerCase(),
          type: 'REQUEST_CANCELLED',
          requestId: Number(requestId),
          blockNumber: event.log.blockNumber,
          status: 'confirmed',
        });

        console.log(`✅ Request #${requestId} marked as cancelled`);
      } catch (error) {
        console.error('Error processing RequestCancelled event:', error);
      }
    });

    console.log('✅ Blockchain event listeners started successfully');
  }

  // Sync past events (optional - for initial setup)
  async syncPastEvents(fromBlock = 0) {
    try {
      console.log('🔄 Syncing past events from blockchain...');

      const latestBlock = await provider.getBlockNumber();

      // Get LoanRequested events
      const requestedFilter = lendingPlatformContract.filters.LoanRequested();
      const requestedEvents = await lendingPlatformContract.queryFilter(
        requestedFilter,
        fromBlock,
        latestBlock
      );

      console.log(`Found ${requestedEvents.length} LoanRequested events`);

      // Get LoanFunded events
      const fundedFilter = lendingPlatformContract.filters.LoanFunded();
      const fundedEvents = await lendingPlatformContract.queryFilter(
        fundedFilter,
        fromBlock,
        latestBlock
      );

      console.log(`Found ${fundedEvents.length} LoanFunded events`);

      // Process events...
      // (Add processing logic similar to event listeners)

      console.log('✅ Past events synced successfully');
    } catch (error) {
      console.error('Error syncing past events:', error);
    }
  }
}

module.exports = new BlockchainService();