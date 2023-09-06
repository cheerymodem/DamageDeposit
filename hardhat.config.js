require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  mocha:{
    reporter: 'spec',
  },
  networks: {
    sepolia:{
      url: "",
      accounts: [""]
    },
    mainnet:{
      url:"",
      accounts: [""]
    }
  },
};
