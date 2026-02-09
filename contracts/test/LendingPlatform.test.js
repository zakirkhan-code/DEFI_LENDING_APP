// test/LendingPlatform.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LendingPlatform", function () {
  let lendingPlatform;
  let loanToken;
  let creditScore;
  let owner;
  let borrower;
  let lender;

  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();

    // Deploy LoanToken
    const LoanToken = await ethers.getContractFactory("LoanToken");
    loanToken = await LoanToken.deploy();
    await loanToken.waitForDeployment();

    // Deploy CreditScore
    const CreditScore = await ethers.getContractFactory("CreditScore");
    creditScore = await CreditScore.deploy();
    await creditScore.waitForDeployment();

    // Deploy LendingPlatform
    const LendingPlatform = await ethers.getContractFactory("LendingPlatform");
    lendingPlatform = await LendingPlatform.deploy(
      await loanToken.getAddress(),
      await creditScore.getAddress()
    );
    await lendingPlatform.waitForDeployment();

    // Setup permissions
    await creditScore.authorizePlatform(await lendingPlatform.getAddress(), true);
    await loanToken.setLendingPlatform(await lendingPlatform.getAddress());

    await lendingPlatform.updateMinCreditScore(0);
  });

  describe("Loan Request Creation", function () {
    it("Should create a loan request successfully", async function () {
      const requestedAmount = ethers.parseEther("1");
      const collateral = ethers.parseEther("1.5");
      const interestRate = 500; // 5%
      const duration = 30; // 30 days

      await expect(
        lendingPlatform.connect(borrower).createLoanRequest(
          requestedAmount,
          interestRate,
          duration,
          { value: collateral }
        )
      ).to.emit(lendingPlatform, "LoanRequested");

      const request = await lendingPlatform.loanRequests(1);
      expect(request.borrower).to.equal(borrower.address);
      expect(request.requestedAmount).to.equal(requestedAmount);
    });

    it("Should reject insufficient collateral", async function () {
      const requestedAmount = ethers.parseEther("1");
      const insufficientCollateral = ethers.parseEther("1"); // Should be 1.5

      await expect(
        lendingPlatform.connect(borrower).createLoanRequest(
          requestedAmount,
          500,
          30,
          { value: insufficientCollateral }
        )
      ).to.be.revertedWith("Collateral must be 150% of loan");
    });

    it("Should reject borrower funding own request", async function () {
      const amount = ethers.parseEther("1");
      
      await lendingPlatform.connect(borrower).createLoanRequest(
        amount,
        500,
        30,
        { value: ethers.parseEther("1.5") }
      );

      await expect(
        lendingPlatform.connect(borrower).fundLoan(1, { value: amount })
      ).to.be.revertedWith("Cannot fund own request");
    });
  });

  describe("Loan Funding", function () {
    beforeEach(async function () {
      // Create a loan request first
      await lendingPlatform.connect(borrower).createLoanRequest(
        ethers.parseEther("1"),
        500,
        30,
        { value: ethers.parseEther("1.5") }
      );
    });

    it("Should fund loan successfully", async function () {
      await expect(
        lendingPlatform.connect(lender).fundLoan(1, {
          value: ethers.parseEther("1")
        })
      ).to.emit(lendingPlatform, "LoanFunded");

      const loan = await lendingPlatform.loans(1);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.isActive).to.be.true;
    });

    it("Should update credit score after funding", async function () {
      await lendingPlatform.connect(lender).fundLoan(1, {
        value: ethers.parseEther("1")
      });

      const creditDetails = await creditScore.getCreditDetails(borrower.address);
      expect(creditDetails.totalBorrowed).to.equal(ethers.parseEther("1"));
      expect(creditDetails.activeLoans).to.equal(1);
    });
  });

  describe("Loan Repayment", function () {
    beforeEach(async function () {
      // Create and fund a loan
      await lendingPlatform.connect(borrower).createLoanRequest(
        ethers.parseEther("1"),
        500, // 5% interest
        30,
        { value: ethers.parseEther("1.5") }
      );

      await lendingPlatform.connect(lender).fundLoan(1, {
        value: ethers.parseEther("1")
      });
    });

    it("Should repay loan successfully", async function () {
      const repaymentAmount = ethers.parseEther("1.05"); // 1 ETH + 5% interest

      await expect(
        lendingPlatform.connect(borrower).repayLoan(1, {
          value: repaymentAmount
        })
      ).to.emit(lendingPlatform, "LoanRepaid");

      const loan = await lendingPlatform.loans(1);
      expect(loan.isRepaid).to.be.true;
      expect(loan.isActive).to.be.false;
    });

    it("Should distribute rewards on repayment", async function () {
      const repaymentAmount = ethers.parseEther("1.05");

      await lendingPlatform.connect(borrower).repayLoan(1, {
        value: repaymentAmount
      });

      const borrowerReward = await loanToken.rewardsEarned(borrower.address);
      const lenderReward = await loanToken.rewardsEarned(lender.address);

      expect(borrowerReward).to.be.gt(0);
      expect(lenderReward).to.be.gt(0);
    });

    it("Should return collateral after repayment", async function () {
      const initialBalance = await ethers.provider.getBalance(borrower.address);
      
      await lendingPlatform.connect(borrower).repayLoan(1, {
        value: ethers.parseEther("1.05")
      });

      // Borrower should get collateral back (1.5 ETH)
      const loan = await lendingPlatform.loans(1);
      expect(loan.isRepaid).to.be.true;
    });
  });

  describe("Loan Liquidation", function () {
    beforeEach(async function () {
      await lendingPlatform.connect(borrower).createLoanRequest(
        ethers.parseEther("1"),
        500,
        1, // 1 day duration for easy testing
        { value: ethers.parseEther("1.5") }
      );

      await lendingPlatform.connect(lender).fundLoan(1, {
        value: ethers.parseEther("1")
      });
    });

    it("Should liquidate defaulted loan", async function () {
      // Fast forward time past loan duration
      await time.increase(2 * 24 * 60 * 60); // 2 days

      await expect(
        lendingPlatform.connect(lender).liquidateLoan(1)
      ).to.emit(lendingPlatform, "LoanDefaulted");

      const loan = await lendingPlatform.loans(1);
      expect(loan.isDefaulted).to.be.true;
    });

    it("Should not allow liquidation before expiry", async function () {
      await expect(
        lendingPlatform.connect(lender).liquidateLoan(1)
      ).to.be.revertedWith("Loan not expired");
    });

    it("Should update credit score on default", async function () {
      await time.increase(2 * 24 * 60 * 60);
      await lendingPlatform.connect(lender).liquidateLoan(1);

      const creditDetails = await creditScore.getCreditDetails(borrower.address);
      expect(creditDetails.defaultedLoans).to.equal(1);
    });
  });

  describe("View Functions", function () {
    it("Should return active loan requests", async function () {
      await lendingPlatform.connect(borrower).createLoanRequest(
        ethers.parseEther("1"),
        500,
        30,
        { value: ethers.parseEther("1.5") }
      );

      const activeRequests = await lendingPlatform.getActiveLoanRequests();
      expect(activeRequests.length).to.equal(1);
    });

    it("Should calculate repayment correctly", async function () {
      await lendingPlatform.connect(borrower).createLoanRequest(
        ethers.parseEther("1"),
        500,
        30,
        { value: ethers.parseEther("1.5") }
      );

      await lendingPlatform.connect(lender).fundLoan(1, {
        value: ethers.parseEther("1")
      });

      const [total, principal, interest, fee] = 
        await lendingPlatform.calculateRepayment(1);

      expect(principal).to.equal(ethers.parseEther("1"));
      expect(interest).to.equal(ethers.parseEther("0.05")); // 5%
    });
  });
});