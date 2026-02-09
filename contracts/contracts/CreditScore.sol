// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditScore is Ownable {
    
    struct UserCredit {
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 activeLoans;
        uint256 defaultedLoans;
        uint256 onTimeRepayments;
        uint256 lateRepayments;
        uint256 creditScore;
    }
    
    mapping(address => UserCredit) public userCredits;
    mapping(address => bool) public authorizedPlatforms;
    
    event CreditUpdated(address indexed user, uint256 newScore);
    event PlatformAuthorized(address indexed platform, bool status);
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyAuthorized() {
        require(authorizedPlatforms[msg.sender], "Not authorized");
        _;
    }

    function authorizePlatform(address _platform, bool _status) external onlyOwner {
        authorizedPlatforms[_platform] = _status;
        emit PlatformAuthorized(_platform, _status);
    }

    function recordLoan(address _user, uint256 _amount) external onlyAuthorized {
        UserCredit storage credit = userCredits[_user];
        credit.totalBorrowed += _amount;
        credit.activeLoans++;
        _updateCreditScore(_user);
    }

    function recordRepayment(address _user, uint256 _amount, bool _onTime) external onlyAuthorized {
        UserCredit storage credit = userCredits[_user];
        credit.totalRepaid += _amount;
        credit.activeLoans--;
        
        if (_onTime) {
            credit.onTimeRepayments++;
        } else {
            credit.lateRepayments++;
        }
        
        _updateCreditScore(_user);
    }

    function recordDefault(address _user) external onlyAuthorized {
        UserCredit storage credit = userCredits[_user];
        credit.defaultedLoans++;
        credit.activeLoans--;
        _updateCreditScore(_user);
    }

    function _updateCreditScore(address _user) internal {
        UserCredit storage credit = userCredits[_user];
        
        uint256 score = 500;

        if (credit.onTimeRepayments > 0) {
            score += (credit.onTimeRepayments * 50);
        }
        
        if (credit.totalRepaid > 0) {
            uint256 repaymentRate = (credit.totalRepaid * 100) / credit.totalBorrowed;
            if (repaymentRate >= 100) {
                score += 100;
            } else {
                score += repaymentRate;
            }
        }

        if (credit.defaultedLoans > 0) {
            score -= (credit.defaultedLoans * 100);
        }
        
        if (credit.lateRepayments > 0) {
            score -= (credit.lateRepayments * 30);
        }

        if (score > 1000) score = 1000;
        if (score < 0) score = 0;
        
        credit.creditScore = score;
        
        emit CreditUpdated(_user, score);
    }

    function getCreditScore(address _user) external view returns (uint256) {
        return userCredits[_user].creditScore;
    }

    function getCreditDetails(address _user) external view returns (
        uint256 totalBorrowed,
        uint256 totalRepaid,
        uint256 activeLoans,
        uint256 defaultedLoans,
        uint256 creditScore
    ) {
        UserCredit memory credit = userCredits[_user];
        return (
            credit.totalBorrowed,
            credit.totalRepaid,
            credit.activeLoans,
            credit.defaultedLoans,
            credit.creditScore
        );
    }
}