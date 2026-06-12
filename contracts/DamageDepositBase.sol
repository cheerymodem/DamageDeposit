// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

/// Address is not registered, make a deposit first.
error AddressNotRegistered();
/// Withdrawal wait period not met, deposit unlocked at `time`
error CannotWithdrawYet(uint256 time);
/// Withdrawal not started, call initiateWithdraw() first
error WithdrawalNotInitiated();
/// Withdrawal already initiated, deposit unlocked at `time`
error WithdrawalAlreadyInitiated(uint256 time);
/// Wrong deposit amount sent, `depositRequirement` required
error BadDepositAmount();
/// This address already has a valid deposit in this contract
error DepositAlreadyPresent();
/// This contract is not accepting deposits right now.
error DepositUnavailable();



/// Shared lifecycle for the deposit anti-spam mechanism. Concrete contracts
/// supply how value is moved in and out by overriding _receiveDeposit and
/// _sendDeposit (e.g. native ETH vs. an ERC-20 token).
abstract contract DamageDepositBase is Ownable {

  using EnumerableMap for EnumerableMap.AddressToUintMap;

  EnumerableMap.AddressToUintMap private accounts;
  uint256 public immutable withdrawPeriod;
  uint256 public immutable depositRequirement;
  bool public paused;

  event DepositMade(address indexed account);
  event DepositConfiscated(address indexed account);
  event DepositWithdrawn(address indexed account);
  event WithdrawalInitiated(address indexed account,uint256 withdrawalTime);

  // Takes withdraw period in seconds and the deposit requirement in the
  // smallest unit of the deposit asset (wei for ETH, base units for a token)
  constructor(uint256 period, uint256 deporeq) {
    withdrawPeriod = period;
    depositRequirement = deporeq;
    paused = false;
  }

  // Register the caller's deposit. Effects (state + event) happen before the
  // _receiveDeposit interaction so a token transfer hook cannot re-enter and
  // register a second deposit.
  function _deposit() internal {
    // Ensure contract is not locked
    if (paused){
      revert DepositUnavailable();
    }
    // Sender should not already have a deposit
    if(EnumerableMap.contains(accounts, msg.sender)){
      revert DepositAlreadyPresent();
    }
    // Register the sending address, then pull the deposit
    EnumerableMap.set(accounts, msg.sender, 0);
    emit DepositMade(msg.sender);
    _receiveDeposit();
  }

  // Check for presence of deposit and return withdrawal coundown if present
  function checkDeposit(address account) view public returns (bool,uint256) {
    // Valid deposits return true with a wait period of 0
    if (EnumerableMap.contains(accounts, account)){
      return(true, EnumerableMap.get(accounts, account));
    } else{
      return(false,0);
    }
  }

  // Withdraw deposit (user)
  function withdrawDeposit() public {
    // Account must be registered
    (bool success,uint256 timestamp) = EnumerableMap.tryGet(accounts,msg.sender);
    if (!success)
      revert AddressNotRegistered();
    // Account must have withdrawal time set
    if (timestamp == 0)
      revert WithdrawalNotInitiated();
    // Account withdraw time must be before current block timestamp to allow withdrawal
    if (timestamp >= block.timestamp)
      revert CannotWithdrawYet({time: timestamp});
    // Remove the account and refund the deposit to the caller
    EnumerableMap.remove(accounts, msg.sender);
    _sendDeposit(msg.sender);
    emit DepositWithdrawn(msg.sender);
  }

  // Confiscate deposit (admin)
  function confiscate(address account) public onlyOwner() {
    // Account must be registered
    if (!EnumerableMap.contains(accounts, account))
      revert AddressNotRegistered();
    // Remove the account and send the deposit to the admin
    EnumerableMap.remove(accounts, account);
    _sendDeposit(owner());
    emit DepositConfiscated(account);
  }

  // Release deposit early (admin)
  function privWithdraw(address account) public onlyOwner() {
    // Account must be registered
    if (!EnumerableMap.contains(accounts, account))
      revert AddressNotRegistered();
    // Remove the account and refund the deposit to the depositing address
    EnumerableMap.remove(accounts, account);
    _sendDeposit(account);
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

  // Pull depositRequirement of the deposit asset from the caller. Reverts if
  // the caller has not supplied/approved exactly the required amount.
  function _receiveDeposit() internal virtual;

  // Send depositRequirement of the deposit asset to `to`.
  function _sendDeposit(address to) internal virtual;
}
