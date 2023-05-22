require("@nomicfoundation/hardhat-toolbox");
const dotenv = require('dotenv');

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks:{
    hardhat:{
      loggingEnabled: false,
      forking: {
        url: process.env.GOERLI_RPC_URL,
        // по умолчанию форк идёт с последнего блока, но можно указать явно 
        // blockNumber: 1000
      }
    }, 
    goerli:{
      url: process.env.GOERLI_RPC_URL,
      accounts: [ process.env.PIVATE_KEY ]
    }
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKEYCAP_KEY,
    gasPriceApi: process.env.GOERLI_RPC_URL,
    currency: "KZT",
    showTimeSpent: true
  }
};
