require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config({ path: '.env' })
require('hardhat-gas-reporter')
require('@nomiclabs/hardhat-etherscan')

const { PRIVATE_KEY, POLYGONSCAN_KEY } = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',

  networks: {
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      // url: 'https://matic-testnet-archive-rpc.bwarelabs.com',
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      url: 'http://localhost:8545',
      // url: 'https://matic-testnet-archive-rpc.bwarelabs.com',
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: [PRIVATE_KEY],
    },
  },
  // verify your contract on etherscan
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://polygonscan.com/
    apiKey: {
      polygon: POLYGONSCAN_KEY,
    },
  },
}

// npx hardhat compile
// npx hardhat run scripts/deploy.js --network mumbai
