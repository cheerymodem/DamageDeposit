# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DamageDeposit is an Ethereum smart contract anti-spam mechanism. Instead of raising the *work* cost of submitting content (CAPTCHA, email/ID verification), it raises the *financial* cost: users post a refundable ETH deposit, and a service operator can confiscate it in response to abuse. The repo is a Hardhat project containing the Solidity contract, its tests, a deploy script, and a static browser demo interface.

## Commands

```bash
pnpm install                                   # install dependencies
pnpm hardhat compile                           # compile the contract (regenerates artifacts/ + cache/)
pnpm hardhat test                              # run the full Mocha/Chai test suite
pnpm hardhat test --grep "End to end"          # run a single describe block / test by name
pnpm hardhat run scripts/deploy.js --network sepolia  # deploy (network must be filled in, see below)

cd interface && pnpm dlx http-server           # serve the demo UI at http://localhost:8080
```

Note: `pnpm test` is **not** wired up (package.json still has the default placeholder that exits 1). Always use `pnpm hardhat test`.

This project uses **pnpm**. A `.npmrc` pins `node-linker=hoisted` so Hardhat plugins (which expect a flat `node_modules`) resolve correctly under pnpm.

## Architecture

The on-chain logic is split across an abstract base plus two concrete variants that differ only in how value moves in and out:

**`contracts/DamageDepositBase.sol`** — abstract contract (extends OpenZeppelin `Ownable`) holding the entire shared lifecycle. The custom errors are declared at file scope here. It defines two `internal virtual` hooks the variants implement: `_receiveDeposit()` (pull/validate the deposit) and `_sendDeposit(address to)` (pay it out). The shared `_deposit()` applies effects (map write + `DepositMade`) **before** calling `_receiveDeposit()`, so a token transfer hook can't re-enter and register twice.

**`contracts/DamageDeposit.sol`** — `DamageDeposit`, the native-ETH variant. `deposit()` is `payable`; `_receiveDeposit()` reverts unless `msg.value == depositRequirement`; `_sendDeposit()` uses the low-level `.call{value:}` pattern with a `require` on success.

**`contracts/DamageDepositERC20.sol`** — `DamageDepositERC20`, the ERC-20/USDC variant. Constructor also takes an `immutable IERC20 token`. `deposit()` is non-payable and requires a prior `approve`; `_receiveDeposit()` does `token.safeTransferFrom`, `_sendDeposit()` does `token.safeTransfer` (OpenZeppelin `SafeERC20`). Assumes a non-fee, non-rebasing token (USDC fits); `depositRequirement` is in the token's base units (USDC = 6 decimals).

**`contracts/mocks/MockUSDC.sol`** — a 6-decimal ERC-20 with a public `mint`, used only by the ERC-20 tests.

Shared design notes (apply to both variants):
- Account state lives in one `EnumerableMap.AddressToUintMap accounts`. The mapped `uint256` value is overloaded as the deposit's lifecycle state:
  - **not in map** → no deposit
  - **value `0`** → active deposit, withdrawal not yet initiated
  - **value > 0** → withdrawal initiated; the value is the unix timestamp at which withdrawal becomes allowed (`block.timestamp + withdrawPeriod`)
- `withdrawPeriod` and `depositRequirement` are `immutable`, set once in the constructor. The deposit amount is fixed.
- Lifecycle: `deposit()` → `initiateWithdraw()` (starts the timelock) → `withdrawDeposit()` (only after the timelock passes). The timelock exists so operators have a window to detect abuse before funds leave.
- Admin (owner-only) functions: `confiscate()` (sends the deposit to the owner), `privWithdraw()` (refunds a user early), `pause()`/`unpause()` (block new deposits via the `paused` flag).
- `checkDeposit(address)` returns `(bool present, uint256 withdrawTimestamp)` — this two-value return is the off-chain integration point services call to gate content. The boolean and the timestamp together encode the three states above.

**`test/damageDeposit.test.js`** — Mocha/Chai tests for the ETH variant, grouped into `Deposit functionality`, `Withdrawal functionality`, `Admin functions`, and `End to end test`. Each `describe` redeploys a fresh contract in `before()` (deposit `1 ETH`, withdraw period `10s`). Time-dependent paths use `@nomicfoundation/hardhat-network-helpers`'s `time.increase()` to fast-forward past the timelock. Reverts are asserted by string-matching the custom error name in the caught exception message.

**`test/damageDepositERC20.test.js`** — same style for the ERC-20 variant: deploys `MockUSDC` (1 USDC = `1000000`) alongside `DamageDepositERC20`, mints to the signers, and exercises the approve→deposit flow plus token-balance movement through every value path. Note: in the payout paths the token's `Transfer` log precedes the contract's own event, so these tests find events by name (`tx.events.some(e => e.event === ...)`) rather than indexing `tx.events[0]`.

**`scripts/deploy.js`** (ETH) and **`scripts/deployERC20.js`** (token, also takes a token address) — deploy with `withdrawPeriod`/`depositRequirement` hardcoded as top-of-file constants. Edit these before deploying.

**`interface/`** — a dependency-free static demo (`index.html` + `index.js` + bundled `ethers.esm.js`). `index.js` embeds the contract ABI inline, connects via an injected `window.ethereum` wallet, and shows admin-only buttons when the connected signer matches `contract.owner()`. The user enters a deployed contract address in the UI; nothing is hardcoded.

## Important Gotchas

- **The interface ABI must mirror the deployed contract exactly.** `interface/index.js` embeds a hand-maintained copy of the contract ABI (including custom error names, which determine the 4-byte selectors used to decode reverts). If you rename a function or error in the contract, update this ABI and any string-matched assertions in the test in lockstep, or the UI will fail to decode reverts and tests will silently stop matching.
- **`hardhat.config.js` ships with empty `sepolia`/`mainnet` network entries** (blank `url` and `accounts`). Deployment requires filling in an RPC URL and a wallet private key there. These hold secrets — do not commit real values.
- The Solidity version pinned in `hardhat.config.js` is `0.8.18`; the contract's pragma is the looser `>=0.4.22 <0.9.0`.
