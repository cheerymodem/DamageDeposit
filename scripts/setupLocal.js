const hre = require("hardhat");

// Local dev setup: deploys the deposit contracts plus a mock USDC token and
// mints test balances so the interface can be exercised end to end against a
// local node. Run with:
//   pnpm hardhat node                                    # in one terminal
//   pnpm hardhat run scripts/setupLocal.js --network localhost

const withdrawPeriod = 60;        // seconds (short, for easy testing)
const usdcDeposit = "10000000";   // 10 USDC (6 decimals)
const ethDeposit = "0.01";        // 0.01 ETH
const mintAmount = "1000000000";  // 1000 USDC minted per account

async function main() {
  const [owner, second] = await hre.ethers.getSigners();

  // Mock USDC token
  const Token = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await Token.deploy();
  await usdc.deployed();

  // Mint test USDC to the first two accounts
  await (await usdc.mint(owner.address, mintAmount)).wait();
  await (await usdc.mint(second.address, mintAmount)).wait();

  // ERC-20 deposit contract
  const DDE = await hre.ethers.getContractFactory("DamageDepositERC20");
  const dde = await DDE.deploy(withdrawPeriod, usdcDeposit, usdc.address);
  await dde.deployed();

  // ETH deposit contract (lets you test variant auto-detection too)
  const DD = await hre.ethers.getContractFactory("DamageDeposit");
  const dd = await DD.deploy(withdrawPeriod, hre.ethers.utils.parseEther(ethDeposit));
  await dd.deployed();

  const fmt = (v) => hre.ethers.utils.formatUnits(v, 6);
  console.log("\n=== Local deployment ===");
  console.log("Owner account:       ", owner.address);
  console.log("MockUSDC token:      ", usdc.address);
  console.log("DamageDepositERC20:  ", dde.address, `(deposit ${fmt(usdcDeposit)} USDC, ${withdrawPeriod}s lock)`);
  console.log("DamageDeposit (ETH): ", dd.address, `(deposit ${ethDeposit} ETH, ${withdrawPeriod}s lock)`);
  console.log("USDC minted:         ", fmt(mintAmount), "USDC each to the first two accounts");
  console.log("========================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
