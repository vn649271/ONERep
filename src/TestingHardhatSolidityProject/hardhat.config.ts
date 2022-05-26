import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

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
//0x5BE6E77b69BD3d9418712E21B26b920CA86478Cc
const HARMONY_PRIVATE_KEY = "07f301650688c1f07d73f5d9e6c453014101f4fcbcb358c204f84dccd75c0e60"
// const HARMONY_PRIVATE_KEY = "4ab11c8e5db02d4a179e52becbf00fb6110241771bac4e3819e14303ec197902"
//const HARMONY_PRIVATE_KEY = "47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
