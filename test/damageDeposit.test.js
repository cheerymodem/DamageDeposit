const hre = require("hardhat");
const { assert } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { BN, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

  async function deployContract(){
    const DD = await hre.ethers.getContractFactory("DamageDeposit");
    let dd = await DD.deploy(10,hre.ethers.utils.parseEther("1"));
    [owner, otherAccount] = await ethers.getSigners();
    return [owner,otherAccount,dd];
  }

  describe("Deposit functionality", async () => {
    let dd;
    let depositRequirement;
    let tx;
    let owner;
    let otherAccount;
    let ret;

    before("Deploy new contract", async function () {
      [owner,otherAccount,dd] = await deployContract();
      depositRequirement = await dd.depositRequirement.call();
    });

    it("Testing checkDeposit before a deposit is made using non-owner", async () => {
      ret = await dd.checkDeposit(otherAccount.address);
      assert.isFalse(ret[0]);
    });

    it("Testing deposit function with incorrect amount", async () => {
      try{
        await dd.connect(otherAccount).deposit({value: (depositRequirement+1n)});
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'BadDepositAmount');
      }
    });

    it("Testing deposit function with correct amount", async () => {
      try{
        tx = await dd.connect(otherAccount).deposit({value: depositRequirement});
      }
      catch(e){
        assert.fail(e);
      }
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositMade');      
    });

    it("Testing deposit with account having existing deposit", async () => {
      try{
        await dd.connect(otherAccount).deposit({value: depositRequirement});
      }
      catch(e){
        assert.include(e.message,'DepositAlreadyPresent');
      }
    });

    it("Testing checkDeposit returns true for valid deposit", async () => {
      ret = await dd.checkDeposit(otherAccount.address);
      assert.isTrue(ret[0]);
    });
  })

  describe("Withdrawal functionality", async () => {
    let dd;
    let depositRequirement;
    let tx;
    let owner;
    let otherAccount;
    let withdrawTime;
    let ret;

    before("Deploy new contract", async function () {
      [owner,otherAccount,dd] = await deployContract();
      withdrawTime = await dd.withdrawPeriod.call().then((a) => a.toNumber());
      depositRequirement = await dd.depositRequirement.call();
    });

    it("Testing withdrawal for account without deposit", async () => {
      try{
        await dd.connect(otherAccount).withdrawDeposit();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'AddressNotRegistered');
      }
    });

    it("Testing withdrawal for account not in withdrawal mode", async () => {
      try{
        await dd.connect(otherAccount).deposit({value: depositRequirement});
        await dd.connect(otherAccount).withdrawDeposit();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'WithdrawalNotIntiated');
      }
    });

    it("Testing marking valid account for withdrawal", async () => {
      try{
        tx = await dd.connect(otherAccount).initiateWithdraw();
      }
      catch(e){
        assert.fail(e);
      }
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'WithdrawalInitiated');
    });

    it("Testing marking invalid account for withdrawal", async () => {
      try{
        await dd.connect(owner).initiateWithdraw();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,"AddressNotRegistered");
      }
    });

    it("Testing marking valid account for withdrawal already in withdrawal", async () => {
      try{
        await dd.connect(otherAccount).initiateWithdraw();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'WithdrawalAlreadyInitiated')
      }
    });

    it("Testing validity of account marked for withdrawal", async () => {
        ret = await dd.checkDeposit(otherAccount.address);
        assert.isAbove(ret[1],0);
    });

    it("Testing withdrawal for valid account before withdraw period", async () => {
      try{
        await dd.connect(otherAccount).withdrawDeposit();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'CannotWithdrawYet');
      }
    });
 

    it("Testing withdrawal for valid account after withdrawal period", async () => {    
      try{
        // wait for the withdrawal to become valid
        await time.increase(withdrawTime+1);
        tx = await dd.connect(otherAccount).withdrawDeposit();
      }
      catch(e){
        assert.fail(e);
      }
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositWithdrawn');
    });

    it("Testing validity of account that has been withdrawn", async () => {
      ret = await dd.checkDeposit(otherAccount.address);
      assert.isFalse(ret[0]);
    });

    it("Testing withdrawal from already withdrawn account", async () => {
      try{
        await dd.connect(otherAccount).withdrawDeposit();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'AddressNotRegistered');
      }
    });
  })

  describe("Admin functions", async () => {
    let dd;
    let depositRequirement;
    let tx;
    let owner;
    let otherAccount;
    let withdrawTime;

    before("Deploy new contract", async function () {
      [owner,otherAccount,dd] = await deployContract();
      withdrawTime = await dd.withdrawPeriod.call().then((a) => a.toNumber());
      depositRequirement = await dd.depositRequirement.call();
    });

    it("Testing releasing account funds early", async () => {
      tx = await dd.connect(otherAccount).deposit({value: depositRequirement});
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositMade');
      before = hre.ethers.BigNumber.from(await otherAccount.getBalance());
      tx = await dd.privWithdraw(otherAccount.address);
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositWithdrawn');
      after = hre.ethers.BigNumber.from(await otherAccount.getBalance());
      assert.isTrue((before.add(depositRequirement)).eq(after));
    });

    it("Testing releasing account funds early for account that doesn't exist", async () => {
      try{
        await dd.privWithdraw(owner.address);
        assert.fail();
      }
      catch(e){
        assert.include(e.message,'AddressNotRegistered')
      }
    });

    it("Testing releasing account funds early as non-admin account", async () => {
      await dd.connect(otherAccount).deposit({value: depositRequirement});
      try{
        await dd.connect(otherAccount).privWithdraw(otherAccount.address);
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'Ownable: caller is not the owner');
      }
    });
    
    it("Testing blocking & unblocking further deposits", async () => {
      await dd.pause();
      try{
        await dd.connect(owner).deposit({value: depositRequirement});
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'DepositUnavailable');
      }
      await dd.unpause();
      try{
        tx = await dd.connect(owner).deposit({value: depositRequirement,});
      }
      catch(e){
        assert.fail(e);
      }
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositMade');
    });

    it("Testing blocking & unblocking deposits as non-admin", async () => {
      try{
        await dd.connect(otherAccount).pause();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'Ownable: caller is not the owner');
      }
      try{
        await dd.connect(otherAccount).unpause();
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'Ownable: caller is not the owner');
      }
    });
    
    it("Testing confiscating deposit", async () => {
      ret = await dd.checkDeposit(otherAccount.address)
      assert.isTrue(ret[0]);
      try{
        tx = await dd.confiscate(otherAccount.address);
      }
      catch(e){
        assert.fail(e);
      }
      ret = await dd.checkDeposit(otherAccount.address)
      assert.isFalse(ret[0]);
      tx = await tx.wait();
      assert.equal(tx.events[0].event,'DepositConfiscated');
    });

    it("Testing confiscating deposit as non-admin account", async () => {
      await dd.connect(otherAccount).deposit({value: depositRequirement});
      ret = await dd.checkDeposit(otherAccount.address)
      assert.isTrue(ret[0]);
      try{
        await dd.connect(otherAccount).confiscate(otherAccount.address);
        assert.fail('Expected an error to be thrown');
      }
      catch(e){
        assert.include(e.message,'Ownable: caller is not the owner');
      }
    });
  })


// Deploy new contract to reintialize state
describe("End to end test",function (accounts) {
  let dd;
  let depositRequirement;
  let tx;
  let owner;
  let otherAccount;
  let withdrawTime;

  before("Deploy new contract", async function () {
    [owner,otherAccount,dd] = await deployContract();
    withdrawTime = await dd.withdrawPeriod.call().then((a) => a.toNumber());
    depositRequirement = await dd.depositRequirement.call();
  });

  it("E2E Test", async function () {
    tx = await dd.connect(otherAccount).deposit({value: depositRequirement});
    tx = await tx.wait();
    assert.equal(tx.events[0].event,'DepositMade');
    tx = await dd.connect(owner).deposit({value: depositRequirement});
    tx = await tx.wait();
    assert.equal(tx.events[0].event,'DepositMade');
    ret = await dd.checkDeposit(otherAccount.address);
    assert.isTrue(ret[0]);
    ret = await dd.checkDeposit(owner.address)
    assert.isTrue(ret[0]);
    tx = await dd.confiscate(otherAccount.address);
    tx = await tx.wait();
    assert.equal(tx.events[0].event,'DepositConfiscated');
    ret = await dd.checkDeposit(otherAccount.address);
    assert.isFalse(ret[0]);
    tx = await dd.connect(owner).initiateWithdraw();
    tx = await tx.wait();
    assert.equal(tx.events[0].event,'WithdrawalInitiated');
    // wait for the withdrawal to become valid
    await time.increase(withdrawTime+1);
    tx = await dd.connect(owner).withdrawDeposit();
    tx = await tx.wait();
    assert.equal(tx.events[0].event,'DepositWithdrawn');
    ret = await dd.checkDeposit(owner.address)
    assert.isFalse(ret[0]);
  });
})