require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const APIKEY=process.env.RINKEBY_APIKEY
const ACCOUNT=process.env.RINKEBY_ACCOUNT
const ETHERSCAN_APIKEY=process.env.ETHERSCAN_APIKEY

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${APIKEY}`,
      accounts: [ACCOUNT],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${ETHERSCAN_APIKEY}`,
  }
};
