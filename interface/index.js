import { ethers } from './ethers.esm.js';
// Expose ethers globally so the rest of this script can use window.ethers.
// Done here (in an external module) rather than in an inline <script> so the
// page can run under a strict Content-Security-Policy with no inline scripts.
window.ethers = ethers;

const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "period",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deporeq",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AddressNotRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BadDepositAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "CannotWithdrawYet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DepositAlreadyPresent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DepositUnavailable",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalAlreadyInitiated",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WithdrawalNotInitiated",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "DepositConfiscated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "DepositMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "DepositWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "withdrawalTime",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalInitiated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "checkDeposit",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "confiscate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositRequirement",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initiateWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "privWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Minimal ERC-20 ABI for the token used by the DamageDepositERC20 variant.
const erc20Abi = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

// Deposit-asset state, set on connect. Defaults describe the native-ETH variant.
let isErc20 = false;
let token;
let assetDecimals = 18;
let assetSymbol = "ETH";

// Format a base-unit amount using the connected deposit asset's decimals.
function formatAmount(amount) {
  return window.ethers.utils.formatUnits(amount, assetDecimals);
}
let signer;
let provider;
let contract;
let myAddress;
let isOwner = false;


const connectWalletBtn = document.getElementById("connect-wallet-btn");
const checkBtn = document.getElementById("check-btn");
const depositBtn = document.getElementById("deposit-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const initiateBtn = document.getElementById("initiate-btn");
const confiscateBtn = document.getElementById("confiscate-btn");
const inputEl = document.getElementById("input");
const addressEl = document.getElementById("address");
const walletAddressEl = document.getElementById("wallet-address");
const pauseBtn = document.getElementById("pause-btn");
const unpauseBtn = document.getElementById("unpause-btn");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const adminwithdrawBtn = document.getElementById("adminwithdraw-btn");
const contractstatusBtn = document.getElementById("contractstatus-btn");
const contractTypeEl = document.getElementById("contract-type");
const adminSectionEl = document.getElementById("admin-section");
const adminButtons = [pauseBtn,unpauseBtn,confiscateBtn,adminwithdrawBtn,checkBtn];
const userButtons = [depositBtn,withdrawBtn,initiateBtn,contractstatusBtn];
// Add event listeners button
checkBtn.addEventListener("click", checkFunction);
depositBtn.addEventListener("click", depositFunction);
withdrawBtn.addEventListener("click", withdrawFunction);
initiateBtn.addEventListener("click", initiateFunction);
confiscateBtn.addEventListener("click", confiscateFunction);
pauseBtn.addEventListener("click", pauseFunction);
unpauseBtn.addEventListener("click", unpauseFunction);
adminwithdrawBtn.addEventListener("click", adminWithdrawFunction);
contractstatusBtn.addEventListener("click", checkContract);

// Validate the account-address input shared by the admin actions. Returns the
// trimmed address, or null (after showing a message) if missing/invalid. ethers
// would reject a malformed address at encode time anyway; this just fails early
// with a clear message instead of a vague caught error.
function getAccountInput() {
  const value = inputEl.value.trim();
  if (!value) {
    outputEl.innerText = "Enter an account address.";
    return null;
  }
  if (!window.ethers.utils.isAddress(value)) {
    outputEl.innerText = "That doesn't look like a valid account address.";
    return null;
  }
  return value;
}

// Define the deposit checking function
async function checkFunction() {
  const account = getAccountInput();
  if (!account) { return; }
  try{
    const validStatus = await contract.checkDeposit(account);
    if (validStatus[0] && validStatus[1] == 0){
      outputEl.innerText = ("Account "+ account + " has a valid deposit\n");
    } else if (validStatus[1] > 0){
      const date = new Date(validStatus[1].toNumber() * 1000).toLocaleString();
      outputEl.innerText = ("Account "+ account + " is waiting for withdrawal at "+date+" GMT\n");
      // TODO: display this using the user's local time zone
    } else{
      outputEl.innerText = ("Account "+ account + " does not have a valid deposit\n");
    }
  }
    catch(e){
      outputEl.innerText = ("Error checking deposit, verify contract and user address");
      console.log(e);
    }
  checkContract();
}

// Define the deposit function
async function depositFunction() {
  let amount;
  try{
    amount = await contract.depositRequirement();
    if (isErc20){
      // ERC-20 deposits are pulled via transferFrom, so the token must be
      // approved for at least the deposit amount first.
      const allowance = await token.allowance(myAddress, contract.address);
      if (allowance.lt(amount)){
        outputEl.innerText = "Approving " + formatAmount(amount) + " " + assetSymbol + "…";
        const approveTx = await token.approve(contract.address, amount);
        await approveTx.wait();
      }
    }
    outputEl.innerText = "Depositing " + formatAmount(amount) + " " + assetSymbol + "…";
    const tx = await contract.deposit(isErc20 ? {} : {value: amount});
    await tx.wait();
    outputEl.innerText = "Deposit of " + formatAmount(amount) + " " + assetSymbol + " complete";
  } catch (error){
    if (await contract.paused()){
      outputEl.innerText = ("Error making deposit, the contract is blocking new deposits.");
    }
    else if ((error.reason || error.message || "").includes("DepositAlreadyPresent")){
      outputEl.innerText = ("Error making deposit, address has existing deposit.");
    }
    else if (amount && (await depositBalance()).lt(amount)){
      outputEl.innerText = ("Error making deposit, wallet balance insufficient.");
    }
    else {
      outputEl.innerText = ("Error making deposit ");
      console.log(error);
    }
  }
  checkContract();
}

// Current balance of the connected wallet in the deposit asset (ETH or token).
async function depositBalance() {
  if (isErc20){
    return token.balanceOf(myAddress);
  }
  return provider.getBalance(myAddress);
}

// Define the admin withdraw function
async function adminWithdrawFunction() {
  const account = getAccountInput();
  if (!account) { return; }
  try {
    const tx = await contract.privWithdraw(account);
    await tx.wait();
    outputEl.innerText = "Admin withdrawal completed";
  } catch (error) {
    console.log(error);
    outputEl.innerText = "Error withdrawing as admin"
  }
  checkContract();
}

// Define the withdraw function
async function withdrawFunction() {
  try {
    const tx = await contract.withdrawDeposit();
    await tx.wait();
    outputEl.innerText = "Withdrawal completed";
  } catch (error) {
    console.log(error);
    outputEl.innerText = "Error withdrawing"
  }
  checkContract();
}

// Define the confiscate deposit function
async function confiscateFunction() {
  const account = getAccountInput();
  if (!account) { return; }
  try {
    const tx = await contract.confiscate(account);
    await tx.wait();
    outputEl.innerText = "Confiscation complete";
  } catch (error) {
    outputEl.innerText = "Error confiscating deposit";
    console.log(error);
  }
  checkContract();
}

// Define the function to intiate a withdrawal
async function initiateFunction() {
  try {
    const tx = await contract.initiateWithdraw();
    const filter = contract.filters.WithdrawalInitiated(myAddress);
    contract.once( filter, (address,time) => {
      const date = new Date(time.toNumber() * 1000).toLocaleString();
      outputEl.innerText = ('You can withdraw at: '+ date);
    });
  } catch (e){
    outputEl.innerText = ("Error intiating withdrawal, do you have a valid deposit?");
    console.log(e);
  }
  checkContract();
}

// Define the function to pause deposits
async function pauseFunction() {
  try {
    const tx = await contract.pause();
    outputEl.innerText =  ("Deposits paused");
  } catch (e){
    outputEl.innerText = ("Error pausing deposits, are you the contract owner?");
    console.log(e);
  }
  checkContract();
}

// Collect the status from the deployed contract
async function checkContract() {
  try {
    let text;
    const paused = await contract.paused();
    if (paused){
      text = "Deposits paused\n"
    } else{
      text = "Deposits can be made\n"
    }
    // Show only the pause/unpause control that applies to the current state
    if (isOwner){
      pauseBtn.hidden = paused;
      unpauseBtn.hidden = !paused;
    }
    text += ("Deposit requirement: " + formatAmount(await contract.depositRequirement()) + " " + assetSymbol + "\n");
    const validStatus = await contract.checkDeposit(myAddress);
    // Enable only the actions valid for the wallet's current deposit state
    const present = validStatus[0];
    const initiated = present && validStatus[1] > 0;
    const unlocked = initiated && validStatus[1].toNumber() <= Math.floor(Date.now() / 1000);
    depositBtn.disabled = present || paused;
    initiateBtn.disabled = !present || initiated;
    withdrawBtn.disabled = !unlocked;
    if (validStatus[0] && validStatus[1] == 0){
      text += ("Account "+ myAddress + " has a valid deposit\n");
    } else if (validStatus[1] > 0){
      const date = new Date(validStatus[1].toNumber() * 1000).toLocaleString();
      text += ("Account "+ myAddress + " is waiting for withdrawal at "+date+" GMT\n");
      // TODO: display this using the user's local time zone
    } else{
      text += ("Account "+ myAddress + " does not have a valid deposit\n");
    }
    if (isOwner){
      text += ("You are the contract owner.");
    }
    statusEl.innerText = text;
  } catch (e){
    outputEl.innerText = ("Error checking contract, verify contract address");
    console.log(e);
  }
}

// Define the function to unpause deposits
async function unpauseFunction() {
  try {
    const tx = await contract.unpause();
    outputEl.innerText =  ("Deposits unpaused");
  } catch (e){
    outputEl.innerText = ("Error unpausing deposits, are you the contract owner?");
    console.log(e);
  }
  checkContract();
}

// Connect the browser wallet: request accounts and set up provider/signer.
// Does not touch the contract — that happens in loadContract() once an
// address is available, so the two steps work in either order.
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    outputEl.innerText = "No Ethereum wallet detected. Install MetaMask or similar.";
    return false;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new window.ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    myAddress = await signer.getAddress();
  } catch (e) {
    outputEl.innerText = ("Wallet connect error: " + e);
    return false;
  }
  // Show the connected wallet address (shortened)
  walletAddressEl.textContent = myAddress.slice(0, 6) + "…" + myAddress.slice(-4);
  walletAddressEl.title = myAddress;
  walletAddressEl.hidden = false;
  return true;
}

// Load the contract at the entered address: detect the variant, enable the
// controls, and read current state. Requires a connected wallet.
async function loadContract() {
  if (!signer) {
    outputEl.innerText = "Connect a wallet first.";
    return;
  }
  const address = addressEl.value.trim();
  if (!address) {
    outputEl.innerText = "Enter a contract address to load.";
    return;
  }
  if (!window.ethers.utils.isAddress(address)) {
    outputEl.innerText = "That doesn't look like a valid contract address.";
    return;
  }

  contract = new window.ethers.Contract(address, abi, signer);
  try {
    await contract.deployed();
  } catch (e) {
    console.log(e);
    outputEl.innerText = "No contract found at that address on this network.";
    return;
  }

  // Detect the deposit asset: the ERC-20 variant exposes a token() getter,
  // the native-ETH variant does not.
  isErc20 = false;
  assetDecimals = 18;
  assetSymbol = "ETH";
  token = undefined;
  try {
    const tokenAddress = await contract.token();
    token = new window.ethers.Contract(tokenAddress, erc20Abi, signer);
    assetDecimals = await token.decimals();
    assetSymbol = await token.symbol();
    isErc20 = true;
  } catch (e) {
    // No token() getter — native-ETH variant, the defaults above apply.
  }
  // Build the badge with textContent so a hostile token symbol can't inject HTML
  contractTypeEl.textContent = "Deposit asset: ";
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = isErc20 ? assetSymbol + " (ERC-20)" : "ETH";
  contractTypeEl.appendChild(badge);
  contractTypeEl.hidden = false;

  userButtons.forEach((el) => el.disabled = false);
  outputEl.innerText = "Connected";

  // Reveal the admin controls only to the contract owner (re-evaluated on
  // every load, so switching to a contract you don't own hides them again)
  isOwner = (await contract.owner()) == (await signer.getAddress());
  adminSectionEl.hidden = !isOwner;
  adminButtons.forEach((el) => el.hidden = !isOwner);

  checkContract();
}

// Connect wallet, then load the contract if an address is already entered.
connectWalletBtn.addEventListener("click", async () => {
  const connected = await connectWallet();
  if (connected) {
    await loadContract();
  }
});

// Re-load the contract whenever the address field changes, once a wallet is
// connected — so connecting and entering the address work in any order.
addressEl.addEventListener("change", () => {
  if (signer) {
    loadContract();
  }
});

// Prefill the contract address from a ?contract=0x… (or ?address=0x…) URL
// parameter, so the panel can be linked to with a contract preselected.
const linkParams = new URLSearchParams(window.location.search);
const linkedAddress = linkParams.get("contract") || linkParams.get("address");
if (linkedAddress) {
  addressEl.value = linkedAddress;
}
