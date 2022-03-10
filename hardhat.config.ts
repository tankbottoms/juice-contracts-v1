import dotenv from 'dotenv';
import taskNames from 'hardhat/builtin-tasks/task-names';
import { task, HardhatUserConfig } from 'hardhat/config';

import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';

dotenv.config();

const defaultNetwork = 'localhost';

const infuraId = process.env.INFURA_ID;
const ALCHEMY_MUMBAI_API_KEY = process.env.ALCHEMY_MUMBAI_API_KEY;
const ALCHEMY_MATIC_API_KEY = process.env.ALCHEMY_MATIC_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  defaultNetwork,
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/' + infuraId,
      gasPrice: 160000000000,
      accounts: [PRIVATE_KEY],
      chainId: 1,
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/' + infuraId,
      gasPrice: 50000000000,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
    matic: {
      url: 'https://polygon-mainnet.g.alchemy.com/v2/' + ALCHEMY_MATIC_API_KEY,
      gasPrice: 160000000000,
      allowUnlimitedContractSize: true,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      verify: {
        etherscan: {
          apiKey: process.env.POLYGONSCAN_API_KEY,
        },
      },
    },
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/' + ALCHEMY_MUMBAI_API_KEY,
      gasPrice: 160000000000,
      allowUnlimitedContractSize: true,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      verify: {
        etherscan: {
          apiKey: process.env.POLYGONSCAN_API_KEY,
        },
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeCollector: {
      default: 0,
    },
  },
  solidity: {
    version: '0.8.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  mocha: {
    bail: true,
    timeout: 6000,
  },
  gasReporter: {
    currency: 'USD',
    // gasPrice: 21,
    enabled: !!process.env.REPORT_GAS,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    }
  }
};

export default config;

task('compile:one', 'Compiles a single contract in isolation')
  .addPositionalParam('contractName')
  .setAction(async function (args, env) {
    const sourceName = env.artifacts.readArtifactSync(args.contractName).sourceName;

    const dependencyGraph = await env.run(taskNames.TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH, {
      sourceNames: [sourceName],
    });

    const resolvedFiles = dependencyGraph.getResolvedFiles().filter((resolvedFile) => {
      return resolvedFile.sourceName === sourceName;
    });

    const compilationJob = await env.run(
      taskNames.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOB_FOR_FILE,
      {
        dependencyGraph,
        file: resolvedFiles[0],
      },
    );

    await env.run(taskNames.TASK_COMPILE_SOLIDITY_COMPILE_JOB, {
      compilationJob,
      compilationJobs: [compilationJob],
      compilationJobIndex: 0,
      emitsArtifacts: true,
      quiet: true,
    });
  });
