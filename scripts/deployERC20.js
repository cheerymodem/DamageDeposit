const hre = require("hardhat");

// The amount of time in seconds between a user deactivating their deposit and being able to withdraw
const withdrawPeriod = 5000;
// The deposit requirement in the token's base units. USDC has 6 decimals, so
// 1 USDC == 1000000. Set this to the amount you require.
const depositRequirement = "1000000";
// Address of the ERC-20 token used for deposits. USDC on Ethereum mainnet is
// 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 — fill in the right one per network.
const tokenAddress = "";

async function main() {

  if (!tokenAddress) {
    throw new Error("Set tokenAddress to the ERC-20 token address before deploying");
  }

  const DD = await hre.ethers.getContractFactory("DamageDepositERC20");
  const dd = await DD.deploy(withdrawPeriod, depositRequirement, tokenAddress);

  await dd.deployed();

  console.log(
    `DamageDepositERC20 with ${depositRequirement} base-unit deposit and unlock wait period ${withdrawPeriod} seconds deployed to ${dd.address} (token ${tokenAddress})`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
