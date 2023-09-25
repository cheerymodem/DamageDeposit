
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
    "name": "WithdrawalNotIntiated",
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
  }
];
let signer;
let provider;
let contract;
let myAddress;


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

// Define the deposit checking function
async function checkFunction() {
  if (inputEl.value) {
    try{
      const validStatus = await contract.checkDeposit(inputEl.value);
      if (validStatus[0] && validStatus[1] == 0){
        outputEl.innerText = ("Account "+ inputEl.value + " has a valid deposit\n");
      } else if (validStatus[1] > 0){
        const date = new Date(validStatus[1].toNumber() * 1000).toLocaleString();
        outputEl.innerText = ("Account "+ inputEl.value + " is waiting for withdrawal at "+date+" GMT\n");
        // TODO: display this using the user's local time zone
      } else{
        outputEl.innerText = ("Account "+ inputEl.value + " does not have a valid deposit\n");
      }
    }
      catch(e){
        outputEl.innerText = ("Error checking deposit, verify contract and user address");
        console.log(e);
      }
  } else {
    outputEl.innerText = ("Must specify a user address to check.")
  }
  checkContract();
}

// Define the deposit function
async function depositFunction() {
  const amount = await contract.depositRequirement();
  outputEl.innerText = "deposit requirement: " + window.ethers.utils.formatEther(amount) + " ETH";
  try{
    const tx = await contract.deposit({value: amount});
    tx.wait();
  } catch (error){
    if (await contract.paused()){
      outputEl.innerText = ("Error making deposit, the contract is blocking new deposits.");
    }
    else if (amount > provider.getBalance(myAddress)){
      outputEl.innerText = ("Error making deposit, wallet balance insufficient.");
    }
    else {
      outputEl.innerText = ("Error making deposit ");
      console.log(error);
    }
  }
  checkContract();
}

// Define the admin withdraw function
async function adminWithdrawFunction() {
  try {
    const tx = await contract.privWithdraw(inputEl.value);
    tx.wait();
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
    outputEl.innerText = "Withdrawal completed";
  } catch (error) {
    console.log(error);
    outputEl.innerText = "Error withdrawing"
  }
  checkContract();
}

// Define the confiscate deposit function
async function confiscateFunction() {
  if (!inputEl.value){
    outputEl.innerText = "Enter address to confiscate from";
  }
  try {
    const tx = await contract.confiscate(inputEl.value);
    outputEl.innerText = "Confiscation complete";
  } catch (error) {
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
    if (await contract.paused()){
      var text = "Deposits paused\n"
    } else{
      text = "Deposits can be made\n"
    }
    text += ("Deposit requirement: " + window.ethers.utils.formatEther(await contract.depositRequirement()) + " ETH\n");
    const validStatus = await contract.checkDeposit(myAddress);
    if (validStatus[0] && validStatus[1] == 0){
      text += ("Account "+ myAddress + " has a valid deposit\n");
    } else if (validStatus[1] > 0){
      const date = new Date(validStatus[1].toNumber() * 1000).toLocaleString();
      text += ("Account "+ myAddress + " is waiting for withdrawal at "+date+" GMT\n");
      // TODO: display this using the user's local time zone
    } else{
      text += ("Account "+ myAddress + " does not have a valid deposit\n");
    }
    if (await contract.owner() == await signer.getAddress()){
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

// Add an event listener to the connect wallet button
connectWalletBtn.addEventListener("click", async () => {
  // Check if the browser has an Ethereum provider (MetaMask, etc.) installed
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request access to the user's Ethereum account
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create a new ethers.js provider using the user's Ethereum provider
      const provider = new window.ethers.providers.Web3Provider(window.ethereum);

      // Get the user's Ethereum address
      const accounts = await provider.listAccounts();
      myAddress = accounts[0];
    } catch (e) { outputEl.innerText = ("wallet connect error"+e); return;}
  }
  // create the provider, signer from provider, and contract from signer
  provider = new window.ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  contract = new window.ethers.Contract(addressEl.value, abi, signer);
  try{
    const contractDeployed = await contract.deployed();
  } catch (e){
    console.log(e);
    outputEl.innerText = "Contract not deployed!";
    return;
  }
  
  // Enable user function buttons
  userButtons.forEach((el,i,a) => el.disabled = false);
  outputEl.innerText = "Connected";
  // Check for owner permissions and unhide admin buttons
  if (await contract.owner() == await signer.getAddress()){
    adminButtons.forEach((el,i,a) => 
      el.hidden = false
    )
  }
  checkContract();
})
