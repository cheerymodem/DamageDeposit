// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

/// Address is not registered, make a deposit first.
error AddressNotRegistered();
/// Withdrawal wait period not met, deposit unlocked at `time`
error CannotWithdrawYet(uint256 time);
/// Withdrawal not started, call initiateWithdraw() first
error WithdrawalNotIntiated();
/// Withdrawal already initiated, deposit unlocked at `time`
error WithdrawalAlreadyInitiated(uint256 time);
/// Wrong deposit amount sent, `depositRequirement` required
error BadDepositAmount();
/// This address already has a valid deposit in this contract
error DepositAlreadyPresent();
/// This contract is not accepting deposits right now.
error DepositUnavailable();



contract DamageDeposit is Ownable {

  using EnumerableMap for EnumerableMap.AddressToUintMap;

  EnumerableMap.AddressToUintMap private accounts;
  uint256 public immutable withdrawPeriod;
  uint256 public immutable depositRequirement;
  bool public paused;

  event DepositMade(address indexed account);
  event DepositConfiscated(address indexed account);
  event DepositWithdrawn(address indexed account);
  event WithdrawalInitiated(address indexed account,uint256 withdrawalTime);

  // Takes withdraw period in seconds and the deposit requirement in wei
  constructor(uint256 period, uint256 deporeq) {
    withdrawPeriod = period;
    depositRequirement = deporeq;
    paused = false;
  }
  
  // Deposit to contract
  function deposit() payable public {
    // Ensure contract is not locked
    if (paused){
      revert DepositUnavailable();
    }
    // Sender must send the required amount
    if(!(msg.value == depositRequirement)){
      revert BadDepositAmount();
    }
    // Sender should not already have a deposit
    if(checkDeposit(msg.sender)){
      revert DepositAlreadyPresent();
    }
    // Register the sending address
    EnumerableMap.set(accounts, msg.sender, 0);
    emit DepositMade(msg.sender);
  }

  // Check valid deposit by address
  function checkDeposit(address account) view public returns (bool) {
    // The account must be registered and not be in withdrawal wait period
    return (EnumerableMap.contains(accounts, account) && EnumerableMap.get(accounts, account) == 0 );
  }

  // Withdraw deposit (user)
  function withdrawDeposit() public {
    // Account must be registered
    (bool success,uint256 timestamp) = EnumerableMap.tryGet(accounts,msg.sender);
    if (!success)
      revert AddressNotRegistered();
    // Account must have withdrawal time set
    if (timestamp == 0)
      revert WithdrawalNotIntiated();
    // Account withdraw time must be before current block timestamp to allow withdrawal
    if (timestamp >= block.timestamp)
      revert CannotWithdrawYet({time: timestamp});
    // Remove the account and refund the deposit to the caller
    EnumerableMap.remove(accounts, msg.sender);
    payable(msg.sender).transfer(depositRequirement);
    emit DepositWithdrawn(msg.sender);
  }

  // Confiscate deposit (admin)
  function confiscate(address account) public onlyOwner() {
    // Account must be registered
    if (!EnumerableMap.contains(accounts, account))
      revert AddressNotRegistered();
    // Remove the account and send the deposit to the admin
    EnumerableMap.remove(accounts, account);
    payable(owner()).transfer(depositRequirement);
    emit DepositConfiscated(account);
  }

  // Release deposit early (admin)
  function privWithdraw(address account) public onlyOwner() {
    // Account must be registered
    if (!EnumerableMap.contains(accounts, account))
      revert AddressNotRegistered();
    // Remove the account and refund the deposit to the depositing address
    EnumerableMap.remove(accounts, account);
    payable(account).transfer(depositRequirement);
    emit DepositWithdrawn(account);
  }

  // Block further deposits (admin)
  function pause() public onlyOwner(){
    paused = true;
  }

  // Resume deposits (admin)
  function unpause() public onlyOwner(){
    paused = false;
  }

  // Mark intent to withdraw, beginning withdrawal countdown
  function initiateWithdraw() public{
    // Account must be registered
    (bool success,uint256 timestamp) = EnumerableMap.tryGet(accounts,msg.sender);
    if (!success)
      revert AddressNotRegistered();
    // Withdrawal must not have already been initiated
    if (timestamp != 0)
      revert WithdrawalAlreadyInitiated(timestamp);
    // Set a future withdrawal target time
    uint256 withdrawTime = block.timestamp+withdrawPeriod;
    EnumerableMap.set(accounts,msg.sender,withdrawTime);
    emit WithdrawalInitiated(msg.sender,withdrawTime);
  }
}