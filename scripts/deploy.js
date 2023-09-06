// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

// The amount of time in seconds between a user deactivating their deposit and being able to withdraw
const withdrawPeriod = 5000;
// The amount of Ethereum to be deposited per user
const depositRequirement = "0.001";

async function main() {

  const DD = await hre.ethers.getContractFactory("DamageDeposit");
  const dd = await DD.deploy(withdrawPeriod, hre.ethers.utils.parseEther(depositRequirement));

  await dd.deployed();

  console.log(
    `DamageDeposit with ${depositRequirement} ETH deposit and unlock wait period ${withdrawPeriod} seconds deployed to ${dd.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
