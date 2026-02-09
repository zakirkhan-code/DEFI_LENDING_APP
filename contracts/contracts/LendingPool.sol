// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingPool is ReentrancyGuard, Ownable {
    
    struct PoolDeposit {
        uint256 amount;
        uint256 depositTime;
        uint256 shares;
    }
    
    mapping(address => PoolDeposit) public deposits;
    
    uint256 public totalPoolLiquidity;
    uint256 public totalShares;
    uint256 public totalInterestEarned;
    
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    uint256 public poolUtilizationRate;
    
    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 interest);
    event InterestDistributed(uint256 totalInterest);
    
    constructor() Ownable(msg.sender) {}
    function depositLiquidity() external payable nonReentrant {
        require(msg.value >= MIN_DEPOSIT, "Minimum deposit not met");
        
        uint256 shares;
        
        if (totalShares == 0) {
            shares = msg.value;
        } else {
            shares = (msg.value * totalShares) / totalPoolLiquidity;
        }
        
        PoolDeposit storage deposit = deposits[msg.sender];
        deposit.amount += msg.value;
        deposit.depositTime = block.timestamp;
        deposit.shares += shares;
        
        totalPoolLiquidity += msg.value;
        totalShares += shares;
        
        emit Deposited(msg.sender, msg.value, shares);
    }

    function withdrawLiquidity(uint256 _shares) external nonReentrant {
        PoolDeposit storage deposit = deposits[msg.sender];
        require(deposit.shares >= _shares, "Insufficient shares");
        
        uint256 withdrawAmount = (_shares * totalPoolLiquidity) / totalShares;
        uint256 userInterest = (_shares * totalInterestEarned) / totalShares;
        
        deposit.shares -= _shares;
        deposit.amount -= withdrawAmount;
        
        totalShares -= _shares;
        totalPoolLiquidity -= withdrawAmount;
        
        payable(msg.sender).transfer(withdrawAmount + userInterest);
        
        emit Withdrawn(msg.sender, withdrawAmount, userInterest);
    }
    function distributeInterest() external payable onlyOwner {
        require(msg.value > 0, "No interest to distribute");
        
        totalInterestEarned += msg.value;
        totalPoolLiquidity += msg.value;
        
        emit InterestDistributed(msg.value);
    }
    function getUserPoolValue(address _user) external view returns (uint256) {
        PoolDeposit memory deposit = deposits[_user];
        if (deposit.shares == 0) return 0;
        
        return (deposit.shares * totalPoolLiquidity) / totalShares;
    }

    function lendFromPool(uint256 _amount) external onlyOwner {
        require(_amount <= totalPoolLiquidity, "Insufficient liquidity");
        totalPoolLiquidity -= _amount;
        payable(msg.sender).transfer(_amount);
    }
}