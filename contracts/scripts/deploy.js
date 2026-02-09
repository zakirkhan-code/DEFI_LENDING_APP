// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...\n");

  // 1. Deploy LoanToken
  console.log("Deploying LoanToken...");
  const LoanToken = await hre.ethers.getContractFactory("LoanToken");
  const loanToken = await LoanToken.deploy();
  await loanToken.waitForDeployment();
  const loanTokenAddress = await loanToken.getAddress();
  console.log("LoanToken deployed to:", loanTokenAddress);

  // 2. Deploy CreditScore
  console.log("\nDeploying CreditScore...");
  const CreditScore = await hre.ethers.getContractFactory("CreditScore");
  const creditScore = await CreditScore.deploy();
  await creditScore.waitForDeployment();
  const creditScoreAddress = await creditScore.getAddress();
  console.log("CreditScore deployed to:", creditScoreAddress);

  // 3. Deploy LendingPool
  console.log("\nDeploying LendingPool...");
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy();
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("LendingPool deployed to:", lendingPoolAddress);

  // 4. Deploy LendingPlatform (Main Contract)
  console.log("\nDeploying LendingPlatform...");
  const LendingPlatform = await hre.ethers.getContractFactory("LendingPlatform");
  const lendingPlatform = await LendingPlatform.deploy(
    loanTokenAddress,
    creditScoreAddress
  );
  await lendingPlatform.waitForDeployment();
  const lendingPlatformAddress = await lendingPlatform.getAddress();
  console.log("LendingPlatform deployed to:", lendingPlatformAddress);

  // 5. Setup permissions
  console.log("\nSetting up permissions...");
  
  // Authorize lending platform in credit score
  await creditScore.authorizePlatform(lendingPlatformAddress, true);
  console.log("✅ LendingPlatform authorized in CreditScore");
  
  // Set lending platform in loan token
  await loanToken.setLendingPlatform(lendingPlatformAddress);
  console.log("✅ LendingPlatform set in LoanToken");

  // Summary
  console.log("\n📋 DEPLOYMENT SUMMARY:");
  console.log("========================");
  console.log("LoanToken:", loanTokenAddress);
  console.log("CreditScore:", creditScoreAddress);
  console.log("LendingPool:", lendingPoolAddress);
  console.log("LendingPlatform:", lendingPlatformAddress);
  console.log("========================\n");

  // Wait for confirmations
  console.log("Waiting for block confirmations...");
  await lendingPlatform.deploymentTransaction().wait(6);

  // Verify contracts
  console.log("\nVerifying contracts on Etherscan...");
  
  try {
    await hre.run("verify:verify", {
      address: loanTokenAddress,
      constructorArguments: [],
    });
    console.log("✅ LoanToken verified");
  } catch (e) {
    console.log("❌ LoanToken verification failed:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: creditScoreAddress,
      constructorArguments: [],
    });
    console.log("✅ CreditScore verified");
  } catch (e) {
    console.log("❌ CreditScore verification failed:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: lendingPoolAddress,
      constructorArguments: [],
    });
    console.log("✅ LendingPool verified");
  } catch (e) {
    console.log("❌ LendingPool verification failed:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: lendingPlatformAddress,
      constructorArguments: [loanTokenAddress, creditScoreAddress],
    });
    console.log("✅ LendingPlatform verified");
  } catch (e) {
    console.log("❌ LendingPlatform verification failed:", e.message);
  }

  console.log("\n🎉 Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });