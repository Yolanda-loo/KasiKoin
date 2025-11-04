require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

// Load environment variables if present
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";
const ALFAJORES_RPC = "https://alfajores-forno.celo-testnet.org";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    alfajores: {
      url: ALFAJORES_RPC,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 44787,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};