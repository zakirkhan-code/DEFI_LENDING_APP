// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILoanToken {
    function mintReward(address to, uint256 amount) external;
}

interface ICreditScore {
    function recordLoan(address user, uint256 amount) external;
    function recordRepayment(address user, uint256 amount, bool onTime) external;
    function recordDefault(address user) external;
    function getCreditScore(address user) external view returns (uint256);
}

contract LendingPlatform is ReentrancyGuard, Ownable {

    ILoanToken public loanToken;
    ICreditScore public creditScore;
    
    struct Loan {
        uint256 loanId;
        address borrower;
        address lender;
        uint256 loanAmount;
        uint256 collateralAmount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
    }
    
    struct LoanRequest {
        uint256 requestId;
        address borrower;
        uint256 requestedAmount;
        uint256 collateralAmount;
        uint256 interestRate;
        uint256 duration;
        bool isFunded;
        bool isCancelled;
    }
    
    uint256 public loanCounter;
    uint256 public requestCounter;
    uint256 public platformFee = 100;
    uint256 public minCreditScore = 300;
    
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256[]) public userLendingHistory;
    mapping(address => uint256[]) public userRequests;
    
    event LoanRequested(
        uint256 indexed requestId,
        address indexed borrower,
        uint256 amount,
        uint256 collateral,
        uint256 interestRate,
        uint256 duration
    );
    
    event LoanFunded(
        uint256 indexed loanId,
        uint256 indexed requestId,
        address indexed lender,
        address borrower,
        uint256 amount
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 totalAmount,
        uint256 rewardEarned
    );
    
    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed lender
    );
    
    event RequestCancelled(
        uint256 indexed requestId,
        address indexed borrower
    );
    
    event RewardDistributed(
        address indexed user,
        uint256 amount,
        string rewardType
    );
    
    constructor(
        address _loanToken,
        address _creditScore
    ) Ownable(msg.sender) {
        require(_loanToken != address(0), "Invalid token address");
        require(_creditScore != address(0), "Invalid credit score address");
        
        loanToken = ILoanToken(_loanToken);
        creditScore = ICreditScore(_creditScore);
    }

    function createLoanRequest(
        uint256 _requestedAmount,
        uint256 _interestRate,
        uint256 _duration
    ) external payable nonReentrant {
        require(_requestedAmount > 0, "Amount must be greater than 0");
        require(_interestRate > 0 && _interestRate <= 10000, "Invalid interest rate");
        require(_duration >= 1 && _duration <= 365, "Duration must be 1-365 days");
        require(msg.value >= _requestedAmount * 150 / 100, "Collateral must be 150% of loan");

        uint256 userCreditScore = creditScore.getCreditScore(msg.sender);
        require(userCreditScore >= minCreditScore, "Credit score too low");
        
        requestCounter++;
        
        loanRequests[requestCounter] = LoanRequest({
            requestId: requestCounter,
            borrower: msg.sender,
            requestedAmount: _requestedAmount,
            collateralAmount: msg.value,
            interestRate: _interestRate,
            duration: _duration,
            isFunded: false,
            isCancelled: false
        });
        
        userRequests[msg.sender].push(requestCounter);
        
        emit LoanRequested(
            requestCounter,
            msg.sender,
            _requestedAmount,
            msg.value,
            _interestRate,
            _duration
        );
    }

    function fundLoan(uint256 _requestId) external payable nonReentrant {
        LoanRequest storage request = loanRequests[_requestId];
        
        require(!request.isFunded, "Already funded");
        require(!request.isCancelled, "Request cancelled");
        require(msg.sender != request.borrower, "Cannot fund own request");
        require(msg.value == request.requestedAmount, "Incorrect amount");
        
        loanCounter++;
        
        loans[loanCounter] = Loan({
            loanId: loanCounter,
            borrower: request.borrower,
            lender: msg.sender,
            loanAmount: request.requestedAmount,
            collateralAmount: request.collateralAmount,
            interestRate: request.interestRate,
            duration: request.duration,
            startTime: block.timestamp,
            endTime: block.timestamp + (request.duration * 1 days),
            isActive: true,
            isRepaid: false,
            isDefaulted: false
        });
        
        request.isFunded = true;
        
        userLoans[request.borrower].push(loanCounter);
        userLendingHistory[msg.sender].push(loanCounter);

        creditScore.recordLoan(request.borrower, request.requestedAmount);

        payable(request.borrower).transfer(request.requestedAmount);
        
        emit LoanFunded(loanCounter, _requestId, msg.sender, request.borrower, request.requestedAmount);
    }

    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.isActive, "Loan not active");
        require(msg.sender == loan.borrower, "Not the borrower");
        require(!loan.isRepaid, "Already repaid");
        require(block.timestamp <= loan.endTime, "Loan expired");
        
        uint256 interest = (loan.loanAmount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.loanAmount + interest;
        uint256 fee = (interest * platformFee) / 10000;
        
        require(msg.value == totalRepayment, "Incorrect repayment amount");
        
        loan.isRepaid = true;
        loan.isActive = false;

        bool onTime = block.timestamp <= loan.endTime;

        creditScore.recordRepayment(msg.sender, loan.loanAmount, onTime);

        uint256 borrowerReward = onTime ? (loan.loanAmount * 100) / 10000 : (loan.loanAmount * 50) / 10000;
        uint256 lenderReward = (loan.loanAmount * 100) / 10000;

        loanToken.mintReward(msg.sender, borrowerReward);
        loanToken.mintReward(loan.lender, lenderReward);
        
        emit RewardDistributed(msg.sender, borrowerReward, "Borrower Repayment");
        emit RewardDistributed(loan.lender, lenderReward, "Lender Interest");

        payable(loan.lender).transfer(totalRepayment - fee);

        payable(loan.borrower).transfer(loan.collateralAmount);
        
        emit LoanRepaid(_loanId, msg.sender, totalRepayment, borrowerReward);
    }

    function liquidateLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.isActive, "Loan not active");
        require(msg.sender == loan.lender, "Not the lender");
        require(block.timestamp > loan.endTime, "Loan not expired");
        require(!loan.isRepaid, "Already repaid");
        
        loan.isDefaulted = true;
        loan.isActive = false;

        creditScore.recordDefault(loan.borrower);

        payable(loan.lender).transfer(loan.collateralAmount);
        
        emit LoanDefaulted(_loanId, loan.borrower, loan.lender);
    }

    function cancelLoanRequest(uint256 _requestId) external nonReentrant {
        LoanRequest storage request = loanRequests[_requestId];
        
        require(msg.sender == request.borrower, "Not the borrower");
        require(!request.isFunded, "Already funded");
        require(!request.isCancelled, "Already cancelled");
        
        request.isCancelled = true;

        payable(request.borrower).transfer(request.collateralAmount);
        
        emit RequestCancelled(_requestId, msg.sender);
    }

    function getActiveLoanRequests() external view returns (uint256[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= requestCounter; i++) {
            if (!loanRequests[i].isFunded && !loanRequests[i].isCancelled) {
                activeCount++;
            }
        }

        uint256[] memory activeRequests = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= requestCounter; i++) {
            if (!loanRequests[i].isFunded && !loanRequests[i].isCancelled) {
                activeRequests[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeRequests;
    }

    function getUserRequests(address _user) external view returns (uint256[] memory) {
        return userRequests[_user];
    }

    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }

    function getUserLendingHistory(address _user) external view returns (uint256[] memory) {
        return userLendingHistory[_user];
    }

    function getUserActiveLoansCount(address _user) external view returns (uint256) {
        uint256 activeCount = 0;
        uint256[] memory userLoanIds = userLoans[_user];
        
        for (uint256 i = 0; i < userLoanIds.length; i++) {
            if (loans[userLoanIds[i]].isActive) {
                activeCount++;
            }
        }
        
        return activeCount;
    }

    function calculateRepayment(uint256 _loanId) external view returns (
        uint256 totalRepayment,
        uint256 principal,
        uint256 interest,
        uint256 platformFeeAmount
    ) {
        Loan memory loan = loans[_loanId];
        principal = loan.loanAmount;
        interest = (loan.loanAmount * loan.interestRate) / 10000;
        platformFeeAmount = (interest * platformFee) / 10000;
        totalRepayment = principal + interest;
        
        return (totalRepayment, principal, interest, platformFeeAmount);
    }

    function getLoanDetails(uint256 _loanId) external view returns (
        address borrower,
        address lender,
        uint256 loanAmount,
        uint256 collateralAmount,
        uint256 interestRate,
        uint256 endTime,
        bool isActive,
        bool isRepaid,
        bool isDefaulted
    ) {
        Loan memory loan = loans[_loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.loanAmount,
            loan.collateralAmount,
            loan.interestRate,
            loan.endTime,
            loan.isActive,
            loan.isRepaid,
            loan.isDefaulted
        );
    }

    function getRequestDetails(uint256 _requestId) external view returns (
        address borrower,
        uint256 requestedAmount,
        uint256 collateralAmount,
        uint256 interestRate,
        uint256 duration,
        bool isFunded,
        bool isCancelled
    ) {
        LoanRequest memory request = loanRequests[_requestId];
        return (
            request.borrower,
            request.requestedAmount,
            request.collateralAmount,
            request.interestRate,
            request.duration,
            request.isFunded,
            request.isCancelled
        );
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Fee too high");
        platformFee = _newFee;
    }

    function updateMinCreditScore(uint256 _newMinScore) external onlyOwner {
        require(_newMinScore <= 1000, "Invalid credit score");
        minCreditScore = _newMinScore;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}