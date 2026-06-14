import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    // ── Celo Mainnet ──────────────────────────────────────────────────
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: [DEPLOYER_KEY],
      // Legacy transactions only — no EIP-1559 on Celo from hardhat
      gasPrice: 5_000_000_000, // 5 gwei
    },
    // ── Celo Sepolia Testnet ──────────────────────────────────────────
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org",
      chainId: 11142220,
      accounts: [DEPLOYER_KEY],
      gasPrice: 5_000_000_000,
    },
  },
  etherscan: {
    apiKey: {
      celo: ETHERSCAN_KEY,
      celoSepolia: ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://celo-sepolia.blockscout.com/api",
          browserURL: "https://celo-sepolia.blockscout.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
