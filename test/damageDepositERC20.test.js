const hre = require("hardhat");
const { assert } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// MockUSDC has 6 decimals, like real USDC, so 1 USDC == 1_000_000 base units.
const ONE_USDC = 1000000n;

async function deployContract(){
  const [owner, otherAccount] = await hre.ethers.getSigners();
  const Token = await hre.ethers.getContractFactory("MockUSDC");
  const token = await Token.deploy();
  const DD = await hre.ethers.getContractFactory("DamageDepositERC20");
  const dd = await DD.deploy(10, ONE_USDC, token.address);
  // Fund both signers so they can make deposits
  await token.mint(owner.address, ONE_USDC * 100n);
  await token.mint(otherAccount.address, ONE_USDC * 100n);
  return [owner, otherAccount, token, dd];
}

describe("ERC20 deposit lifecycle", () => {
  let owner;
  let otherAccount;
  let token;
  let dd;
  let req;
  let tx;
  let ret;

  before("Deploy new contract", async () => {
    [owner, otherAccount, token, dd] = await deployContract();
    req = await dd.depositRequirement();
  });

  it("Rejects a deposit without prior approval", async () => {
    try{
      await dd.connect(otherAccount).deposit();
      assert.fail('Expected an error to be thrown');
    }
    catch(e){
      assert.include(e.message, 'insufficient allowance');
    }
  });

  it("Accepts a deposit after approval and pulls the tokens", async () => {
    const userBefore = await token.balanceOf(otherAccount.address);
    const contractBefore = await token.balanceOf(dd.address);
    await token.connect(otherAccount).approve(dd.address, req);
    tx = await dd.connect(otherAccount).deposit();
    tx = await tx.wait();
    assert.equal(tx.events[0].event, 'DepositMade');
    assert.isTrue((await token.balanceOf(otherAccount.address)).eq(userBefore.sub(req)));
    assert.isTrue((await token.balanceOf(dd.address)).eq(contractBefore.add(req)));
  });

  it("Rejects a second deposit from the same account", async () => {
    await token.connect(otherAccount).approve(dd.address, req);
    try{
      await dd.connect(otherAccount).deposit();
      assert.fail('Expected an error to be thrown');
    }
    catch(e){
      assert.include(e.message, 'DepositAlreadyPresent');
    }
  });

  it("Reports the deposit via checkDeposit", async () => {
    ret = await dd.checkDeposit(otherAccount.address);
    assert.isTrue(ret[0]);
  });

  it("Blocks withdrawal before the timelock elapses", async () => {
    await dd.connect(otherAccount).initiateWithdraw();
    try{
      await dd.connect(otherAccount).withdrawDeposit();
      assert.fail('Expected an error to be thrown');
    }
    catch(e){
      assert.include(e.message, 'CannotWithdrawYet');
    }
  });

  it("Returns the tokens after the timelock elapses", async () => {
    const userBefore = await token.balanceOf(otherAccount.address);
    await time.increase((await dd.withdrawPeriod()).toNumber() + 1);
    tx = await dd.connect(otherAccount).withdrawDeposit();
    tx = await tx.wait();
    assert.isTrue(tx.events.some(e => e.event === 'DepositWithdrawn'));
    assert.isTrue((await token.balanceOf(otherAccount.address)).eq(userBefore.add(req)));
    ret = await dd.checkDeposit(otherAccount.address);
    assert.isFalse(ret[0]);
  });
});

describe("ERC20 admin functions", () => {
  let owner;
  let otherAccount;
  let token;
  let dd;
  let req;
  let tx;

  before("Deploy new contract", async () => {
    [owner, otherAccount, token, dd] = await deployContract();
    req = await dd.depositRequirement();
  });

  async function depositAs(account){
    await token.connect(account).approve(dd.address, req);
    await dd.connect(account).deposit();
  }

  it("Confiscates a deposit to the owner", async () => {
    await depositAs(otherAccount);
    const ownerBefore = await token.balanceOf(owner.address);
    tx = await dd.confiscate(otherAccount.address);
    tx = await tx.wait();
    assert.isTrue(tx.events.some(e => e.event === 'DepositConfiscated'));
    assert.isTrue((await token.balanceOf(owner.address)).eq(ownerBefore.add(req)));
    assert.isFalse((await dd.checkDeposit(otherAccount.address))[0]);
  });

  it("Releases a deposit early back to the depositor", async () => {
    const userBefore = await token.balanceOf(otherAccount.address);
    await depositAs(otherAccount);
    tx = await dd.privWithdraw(otherAccount.address);
    tx = await tx.wait();
    assert.isTrue(tx.events.some(e => e.event === 'DepositWithdrawn'));
    // Net token movement is zero: paid the deposit, got it back
    assert.isTrue((await token.balanceOf(otherAccount.address)).eq(userBefore));
  });

  it("Rejects admin actions from a non-owner", async () => {
    await depositAs(otherAccount);
    try{
      await dd.connect(otherAccount).confiscate(otherAccount.address);
      assert.fail('Expected an error to be thrown');
    }
    catch(e){
      assert.include(e.message, 'Ownable: caller is not the owner');
    }
  });

  it("Rejects deposits while paused", async () => {
    await dd.pause();
    await token.connect(owner).approve(dd.address, req);
    try{
      await dd.connect(owner).deposit();
      assert.fail('Expected an error to be thrown');
    }
    catch(e){
      assert.include(e.message, 'DepositUnavailable');
    }
    await dd.unpause();
  });
});
