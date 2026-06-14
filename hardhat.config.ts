import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
  },
  networks: {
    alfajores: {
      url: "https://forno.celo.org",
      chainId: 44787,
      accounts: [DEPLOYER_KEY],
      gasPrice: 243000000000,
      timeout: 120000,
    },
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: [DEPLOYER_KEY],
      gasPrice: 243000000000,
      timeout: 120000,
    },
  },
  paths: { sources: "./contracts", tests: "./test", cache: "./cache", artifacts: "./artifacts" },
};

export default config;
