## Why?

The only way to defeat spam is to raise the cost of spamming. This can be done two ways: increasing the work needed to submit content (captcha, email verification, IP blacklisting, ID verification) or directly using Damage Deposit. As methods like CAPTCHA increasingly fail due to advancements in ML-based solving and [solving farms](https://en.wikipedia.org/wiki/CAPTCHA#Human_labor), user privacy is constantly [eroded](https://en.wikipedia.org/wiki/ReCAPTCHA#Privacy) as identifying humans from bots becomes increasingly difficult. DamageDeposit provides an alternative by directly increasing the cost of spamming while reducing the impact on legitimate users, using an Ethereum smart contract to collect a deposit that can be confiscated by the service operator in cases of abuse. This also allows spam removal to become a profitable undertaking rather than a financial burden.

## Usage
### Compiling
    npm install
    npx hardhat compile

### Deploying The Contract:
To deploy the smart contract to the Ethereum network you need a network provider, either an RPC provider like Infura or Alchemy (both have free options) or your own Ethereum node. You will also need enough Ethereum to cover gas fees for deploying the contract.  

Point the URL to your mainnet provder:  

`URL=https://YOUR RPC HERE`  

The owner of the contract will have access to the admin functions, most importantly deposit confiscation. The Ethereum account that deploys the contract will be the first contract owner (can be changed later). Keep this account safe, otherwise admin functions cannot be performed.
Set the private key to use for deployment:  

`PK=0x689af8efa8c651a91ad287602527f3af201016501a7ac4b061667b5a93e037fd`  

Other methods of configuring the connected wallet can be found [here](https://hardhat.org/hardhat-runner/docs/config#hd-wallet-config).

Deploy the contract  
`npx hardhat run scripts/deploy.js --network mainnet`

### Deploying to Test Network
The contract can also be deployed to the Sepolia test network to test live functionality without using real Ethereum. Replace the mainnet URL with a Sepolia provider (Infura, Alchemy) and the private key with one having Sepolia ETH

`npx hardhat run scripts/deploy.js --network sepolia`

### Interacting with DamageDeposit
A demo interface is included in the [interface/](/interface) directory. After deploying your contract, you can load the interface to interact with it: 
``` 
cd interface  
npx http-server
```
The page will be available at http://localhost:8080/. You will need a browser-connected Ethereum wallet ([Frame](https://frame.sh/), [Metamask](https://metamask.io/) etc) to sign the transactions.

### Basic Workflow
1. User deposits Ethereum to the contract.
2. User interacts with protected infrastrucutre (forum, service etc) signing their submissions with their Ethereum wallet. 
3. Service checks contract for valid user deposit before accepting content.
4. User signals intent to withdraw when interaction with target service ends.
5. Service admin (forum admin, chat mod, website operator) checks content for rule violations and confiscates user deposit if needed.
6. After timelock period ends, user can withdraw their deposit (if not confiscated).



