const { ethers } = require('ethers');
const LendingPlatformABI = require('../../../contracts/artifacts/contracts/LendingPlatform.sol/LendingPlatform.json').abi;
const LoanTokenABI = require('../../../contracts/artifacts/contracts/LoanToken.sol/LoanToken.json').abi;
const CreditScoreABI = require('../../../contracts/artifacts/contracts/CreditScore.sol/CreditScore.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const lendingPlatformContract = new ethers.Contract(
  process.env.LENDING_PLATFORM_ADDRESS,
  LendingPlatformABI,
  provider
);

const loanTokenContract = new ethers.Contract(
  process.env.LOAN_TOKEN_ADDRESS,
  LoanTokenABI,
  provider
);

const creditScoreContract = new ethers.Contract(
  process.env.CREDIT_SCORE_ADDRESS,
  CreditScoreABI,
  provider
);

module.exports = {
  provider,
  lendingPlatformContract,
  loanTokenContract,
  creditScoreContract,
};