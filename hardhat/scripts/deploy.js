const { utils } = require('ethers')
const { ethers } = require('hardhat')
require('dotenv').config({ path: '.env' })
const fs = require('fs')

async function main() {
  // URL from where we can extract the metadata for a ObiDatti
  // const metadataURL = "ipfs://YOUR-METADATA-CID/";
  const metadataURL = 'ipfs://QmXUhr1eYTMug9NNUm3NqsajtuSwE4EEVP8LEXmn7dunZ8/'

  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so ObiDatti Contract here is a factory for instances of our ObiDatti contract.
  */
  const ObiDattiContract = await ethers.getContractFactory('ObiDatti')

  // deploy the contract
  const deployedObiDattiContract = await ObiDattiContract.deploy(metadataURL)

  // Wait for this transaction to be mined
  await deployedObiDattiContract.deployed()

  // print the address of the deployed contract
  console.log('ObiDatti Contract Address:', deployedObiDattiContract.address)

  // this code writes the contract address, Owner address and contract ABI to a local
  // file named 'config.js' that we can use in the app
  fs.writeFileSync(
    './config.js',
    `
    export const ownerAddress = "${deployedObiDattiContract.signer.address}"
  export const contractAddress = "${deployedObiDattiContract.address}"
  `
  )
  console.log('Sleeping.....')
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(40000)

  // Verify the contract after deploying
  await hre.run('verify:verify', {
    address: deployedObiDattiContract.address,
    constructorArguments: [metadataURL],
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat compile
// npx hardhat run scripts/deploy.js --network mumbai
