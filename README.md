# DamageDeposit

An Ethereum smart contract anti-spam mechanism. Instead of raising the *work*
cost of submitting content (CAPTCHA, email/ID verification), it raises the
*financial* cost: users post a refundable ETH deposit that a service operator
can confiscate in response to abuse.

## Why?

The only way to defeat spam is to raise the cost of spamming. This can be done two ways: increasing the work needed to submit content (captcha, email verification, IP blacklisting, ID verification) or directly using Damage Deposit. As methods like CAPTCHA increasingly fail due to advancements in ML-based solving and [solving farms](https://en.wikipedia.org/wiki/CAPTCHA#Human_labor), user privacy is constantly [eroded](https://en.wikipedia.org/wiki/ReCAPTCHA#Privacy) as identifying humans from bots becomes increasingly difficult. DamageDeposit provides an alternative by directly increasing the cost of spamming while reducing the impact on legitimate users, using an Ethereum smart contract to collect a deposit that can be confiscated by the service operator in cases of abuse. This also allows spam removal to become a profitable undertaking rather than a financial burden.

## Deposit asset: ETH or an ERC-20 (USDC)

Two variants share the same lifecycle logic (defined in
[contracts/DamageDepositBase.sol](contracts/DamageDepositBase.sol)):

- **`DamageDeposit`** — deposits are made in native ETH, sent as the transaction
  value. Deploy with [scripts/deploy.js](scripts/deploy.js).
- **`DamageDepositERC20`** — deposits are made in an ERC-20 token such as USDC.
  The depositor must `approve` the contract for the deposit amount first, then
  call `deposit()` (no value is sent). Deploy with
  [scripts/deployERC20.js](scripts/deployERC20.js), which also takes the token
  address. Amounts are in the token's base units — USDC has **6 decimals**, so
  1 USDC is `1000000`.

## Usage
### Configuration
Edit [scripts/deploy.js](scripts/deploy.js) (ETH) or [scripts/deployERC20.js](scripts/deployERC20.js) (token) with the appropriate contract values for deposit amount and withdrawal hold period. Withdrawal period should be set long enough that abuse can be detected before the user withdraws the deposit.
```
const withdrawPeriod = 5;
const depositRequirement = "0.001";
```
### Compiling
    pnpm install
    pnpm hardhat compile

### Running the tests
    pnpm hardhat test

### Local testing with the demo interface
To exercise the interface end to end against a local node, start a node and run
the setup script, which deploys both contract variants plus a mock USDC token
and mints test balances:

    pnpm hardhat node                                       # terminal 1
    pnpm hardhat run scripts/setupLocal.js --network localhost  # terminal 2

The script prints the deployed contract addresses. Point MetaMask at
`http://127.0.0.1:8545` (chain id `31337`), import one of the node's accounts by
private key, then paste a contract address into the interface to connect.

### Deploying The Contract:
To deploy the smart contract to the Ethereum network you need a network provider, either an RPC provider like Infura or Alchemy (both have free options) or your own Ethereum node. You will also need enough Ethereum to cover gas fees for deploying the contract.  

Point the URL to your mainnet provider by editing [hardhat.config.js](hardhat.config.js) and adding your RPC URL and wallet private key: 
```
    mainnet:{
      url:"https://mainnet.infura.io/v3/1234567890abcdef",
      accounts: ["0xbbbbbbbbccccc2222222222111111111aaaaaaaaaa0000000000"]
    }
```

The owner of the contract (private key) will have access to the admin functions, most importantly deposit confiscation. The Ethereum account that deploys the contract will be the first contract owner and can be changed later. Keep this account safe, otherwise admin functions cannot be performed.

Other methods of configuring the connected wallet can be found [here](https://hardhat.org/hardhat-runner/docs/config#hd-wallet-config).

Deploy the contract  
`pnpm hardhat run scripts/deploy.js --network mainnet`

### Deploying to Test Network
The contract can also be deployed to the Sepolia test network to test live functionality without using real Ethereum. Complete the Sepolia network config in hardhat.config.js with a Sepolia provider (Infura, Alchemy) and wallet containing [Sepolia ETH](https://sepolia-faucet.pk910.de/):

```
    sepolia:{
      url:"https://sepolia.infura.io/v3/1234567890abcdef",
      accounts: ["0xbbbbbbbbccccc2222222222111111111aaaaaaaaaa0000000000"]
    }
```

Then deploy the contract:

`pnpm hardhat run scripts/deploy.js --network sepolia`

### Interacting with DamageDeposit
A demo interface is included in the [interface/](/interface) directory. After deploying your contract, you can load the interface to interact with it: 
``` 
cd interface  
pnpm dlx http-server
```
The page will be available at http://localhost:8080/. You will need a browser-connected Ethereum wallet ([Frame](https://frame.sh/), [Metamask](https://metamask.io/) etc) to sign the transactions.

The interface is intentionally dependency-free: it bundles a copy of `ethers.esm.js` directly rather than pulling it from a package manager or CDN, so it can be served as static files with no build step.

It auto-detects which variant a contract is (ETH vs. ERC-20) by probing for a `token()` getter, formats amounts using the token's decimals/symbol, and runs the required `approve` step before an ERC-20 deposit. You can link to it with a contract preselected via `?contract=0x…`.

### Hosting & security
The interface is a **demo**, and it is a fully static, client-side app: there is no backend, and **no private keys ever touch it** (every transaction is signed in the user's wallet, and the contract enforces all rules — `onlyOwner`, the timelock — on-chain). So a server compromise cannot leak keys or move deposits.

The real risk in hosting it for others is **frontend integrity**: if an attacker can alter the served files (a compromised host, a man-in-the-middle, a tampered CDN), they can inject script that prompts users to sign a malicious transaction. Protect *that*, not server-side data:

- **Serve over HTTPS, with HSTS.** Over plain HTTP, a network attacker can rewrite the page and drain wallets. This is the single most important control.
- **Keep dependencies self-hosted.** `ethers.esm.js` is bundled rather than loaded from a CDN, which removes a third-party tamper point. If you ever switch to a CDN, pin it with Subresource Integrity.
- **Content-Security-Policy.** `index.html` ships a strict `<meta>` CSP (`script-src 'self'`, no inline, no `eval`). [`interface/_headers`](interface/_headers) sets the same as real headers for hosts that support it (Netlify/Cloudflare Pages), plus the header-only protections a meta tag can't provide: `frame-ancestors 'none'` / `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff`, and HSTS. For nginx/Caddy, translate these into `add_header` directives.
- **Use a real static host, not `http-server`.** `pnpm dlx http-server` is for local development only.
- **Contract-trust caveat.** The panel lets users enter (or be linked to, via `?contract=`) *any* address. Make clear which contract(s) your deployment is meant for, so users aren't steered to a hostile look-alike.

A note on XSS: every place user-supplied or on-chain text reaches the page uses `textContent`/`innerText`, never `innerHTML`, so input can't inject executable markup. Keep it that way — switching any of those to `innerHTML` would reopen the hole.

### Basic Workflow
1. User deposits Ethereum to the contract.
2. User interacts with protected infrastructure (forum, service etc) signing their submissions with their Ethereum wallet. 
3. Service checks contract for valid user deposit before accepting content.
4. User signals intent to withdraw when interaction with target service ends.
5. Service admin (forum admin, chat moderator, website operator etc) checks content for rule violations and confiscates user deposit if needed.
6. After timelock period ends, user can withdraw their deposit (if not confiscated).



