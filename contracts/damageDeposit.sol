// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DamageDepositBase.sol";

/// Native-ETH deposit. The deposit is sent as msg.value and refunded with a
/// low-level call.
contract DamageDeposit is DamageDepositBase {

  // Takes withdraw period in seconds and the deposit requirement in wei
  constructor(uint256 period, uint256 deporeq) DamageDepositBase(period, deporeq) {}

  // Deposit to contract
  function deposit() payable external {
    _deposit();
  }

  // The caller must send exactly the required amount of ETH
  function _receiveDeposit() internal override {
    if(!(msg.value == depositRequirement)){
      revert BadDepositAmount();
    }
  }

  // Refund the deposit in ETH
  function _sendDeposit(address to) internal override {
    (bool success, ) = payable(to).call{value: depositRequirement}("");
    require(success, "Transfer failed");
  }
}
