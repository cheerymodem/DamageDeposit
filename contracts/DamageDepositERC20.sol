// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DamageDepositBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// ERC-20 deposit (e.g. USDC). The deposit is pulled with transferFrom, so the
/// depositor must approve this contract for depositRequirement first.
///
/// Assumes a standard, non-rebasing token with no transfer fee (USDC fits):
/// the fixed depositRequirement accounting requires the amount received to
/// equal the amount sent. Do not use with fee-on-transfer or rebasing tokens.
contract DamageDepositERC20 is DamageDepositBase {

  using SafeERC20 for IERC20;

  IERC20 public immutable token;

  // Takes withdraw period in seconds, the deposit requirement in the token's
  // base units (USDC has 6 decimals, so 1 USDC == 1_000_000), and the address
  // of the ERC-20 token to deposit.
  constructor(uint256 period, uint256 deporeq, IERC20 token_) DamageDepositBase(period, deporeq) {
    token = token_;
  }

  // Deposit to contract (caller must approve depositRequirement beforehand)
  function deposit() external {
    _deposit();
  }

  // Pull the required amount of tokens from the caller
  function _receiveDeposit() internal override {
    token.safeTransferFrom(msg.sender, address(this), depositRequirement);
  }

  // Refund the deposit in tokens
  function _sendDeposit(address to) internal override {
    token.safeTransfer(to, depositRequirement);
  }
}
