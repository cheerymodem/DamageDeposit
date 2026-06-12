// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// Minimal 6-decimal ERC-20 standing in for USDC in the tests. Anyone can mint.
contract MockUSDC is ERC20 {
  constructor() ERC20("Mock USD Coin", "USDC") {}

  function decimals() public pure override returns (uint8) {
    return 6;
  }

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
