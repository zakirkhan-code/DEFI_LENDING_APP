// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanToken is ERC20, Ownable {
    
    address public lendingPlatform;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18;
    
    mapping(address => uint256) public rewardsEarned;
    
    event RewardsMinted(address indexed user, uint256 amount);
    
    constructor() ERC20("LoanToken", "LOAN") Ownable(msg.sender) {
        _mint(msg.sender, 100000000 * 10**18);
    }
    
    function setLendingPlatform(address _platform) external onlyOwner {
        lendingPlatform = _platform;
    }

    function mintReward(address _to, uint256 _amount) external {
        require(msg.sender == lendingPlatform, "Only platform can mint");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Max supply reached");
        
        _mint(_to, _amount);
        rewardsEarned[_to] += _amount;
        
        emit RewardsMinted(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(msg.sender, _amount);
    }
}