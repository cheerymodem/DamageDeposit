# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DamageDeposit is an Ethereum smart contract anti-spam mechanism. Instead of raising the *work* cost of submitting content (CAPTCHA, email/ID verification), it raises the *financial* cost: users post a refundable deposit (ETH or an ERC-20 such as USDC), and a service operator can confiscate it in response to abuse. The repo is a Hardhat project containing the Solidity contracts, their tests, deploy scripts, and a static browser demo interface.

## Commands

```bash
pnpm install                                   # install dependencies
pnpm hardhat compile                           # compile the contract (regenerates artifacts/ + cache/)
pnpm hardhat test                              # run the full Mocha/Chai test suite
pnpm hardhat test --grep "End to end"          # run a single describe block / test by name
pnpm hardhat run scripts/deploy.js --network sepolia  # deploy (network must be filled in, see below)

pnpm hardhat node                              # run a local node in a separate terminal
pnpm hardhat run scripts/setupLocal.js --network localhost  # deploy both variants + mock USDC, mint test balances

cd interface && pnpm dlx http-server           # serve the demo UI at http://localhost:8080
```

Note: `pnpm test` and `pnpm compile` are wired to `hardhat test` / `hardhat compile`, so they're equivalent to the `pnpm hardhat …` forms above.

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

**`scripts/deploy.js`** (ETH) and **`scripts/deployERC20.js`** (token, also takes a token address) — deploy with `withdrawPeriod`/`depositRequirement` hardcoded as top-of-file constants. Edit these before deploying. **`scripts/setupLocal.js`** deploys both variants plus `MockUSDC` and mints test balances against a local node — a one-command setup for exercising the interface end to end.

**`interface/`** — a dependency-free static demo: `index.html`, `index.js`, `style.css`, a bundled `ethers.esm.js`, and a `_headers` file (production security headers). `index.js` embeds two hand-maintained ABIs — the DamageDeposit contract ABI (shared by both variants, with a `token()` entry) and a minimal ERC-20 ABI — and connects via an injected `window.ethereum` wallet. Notable behavior:
- Connecting the wallet and entering a contract address work in either order (`connectWallet()` vs `loadContract()`); the address can also be preselected via a `?contract=0x…` URL param.
- On load it **auto-detects the variant** by probing `token()` (ETH vs. ERC-20), formats amounts by the asset's decimals/symbol, and runs the `approve` step before an ERC-20 deposit.
- Action buttons reflect the connected wallet's deposit state and the `paused` flag; admin-only buttons appear when the signer matches `contract.owner()`.
- Nothing is hardcoded — the user supplies the contract address. See the README "Hosting & security" section and the CSP gotcha below.

## Important Gotchas

- **The interface ABIs must mirror the deployed contracts.** `interface/index.js` embeds a hand-maintained copy of the DamageDeposit ABI (including custom error names, whose 4-byte selectors decode reverts) plus a minimal ERC-20 ABI. The one contract ABI serves both variants — `deposit()` is listed as `payable` and simply called with no value for the ERC-20 variant — and includes the `token()` entry used to auto-detect the variant. If you rename a function or error in the contract, update this ABI and any string-matched assertions in the tests in lockstep, or the UI will fail to decode reverts and tests will silently stop matching.
- **The interface runs under a strict Content-Security-Policy** (a `<meta>` tag in `index.html`, mirrored as real headers in `interface/_headers`). It forbids inline scripts, inline event handlers, inline styles, and `eval`. Don't add `<script>…</script>`/`onclick=`/`style=` — load JS from `index.js` and CSS from `style.css`. This is why `window.ethers` is assigned via an `import` in `index.js` rather than an inline script.
- **`hardhat.config.js` ships with empty `sepolia`/`mainnet` network entries** (blank `url` and `accounts`). Deployment requires filling in an RPC URL and a wallet private key there. These hold secrets — do not commit real values.
- The Solidity version pinned in `hardhat.config.js` is `0.8.18`; the contract's pragma is the looser `>=0.4.22 <0.9.0`.
