import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';

const fn: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let chainId = await getChainId();

  let chain: string;
  let multisig: string;

  console.log({ chainId, d: deployer });

  switch (chainId) {
    /*
      // mainnet
      case '1':
        chain = 'mainnet';
        multisig = '0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e';
        break;
        // local
        case '31337':
          chain = 'localhost';
          multisig = '0x69C6026e3938adE9e1ddE8Ff6A37eC96595bF1e1';
          break;
          */
    // rinkeby
    case '4':
      chain = 'rinkeby';
      multisig = '0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e';
      break;
    // polygonMumbai (matic testnet)
    case '137':
      chain = 'polygon';
      multisig = '0x35e28D9a6dE296f98909B4E78E09836d6e93D9bf';
      break;
    // polygonMumbai (matic testnet)
    case '80001':
      chain = 'polygonMumbai';
      multisig = '0x35e28D9a6dE296f98909B4E78E09836d6e93D9bf';
      break;
    default:
      throw new Error(`Chain id ${chainId} not supported`);
  }

  console.log({ chain });
  console.log({ owner: multisig });

  console.log(`contract [OperatorStore] => ${chainId}`);
  const OperatorStore = await deploy('OperatorStore', { from: deployer, log: true, args: [] });

  console.log(`contract [Projects] => ${chainId}`);
  const Projects = await deploy('Projects', {
    from: deployer,
    log: true,
    args: [OperatorStore.address],
  });

  console.log(`contract [TerminalDirectory] => ${chainId}`);
  const TerminalDirectory = await deploy('TerminalDirectory', {
    from: deployer,
    log: true,
    args: [Projects.address, OperatorStore.address],
  });

  console.log(`contract [FundingCycles] => ${chainId}`);
  const FundingCycles = await deploy('FundingCycles', {
    from: deployer,
    log: true,
    args: [TerminalDirectory.address],
  });

  console.log(`contract [TicketBooth] => ${chainId}`);
  const TicketBooth = await deploy('TicketBooth', {
    from: deployer,
    log: true,
    args: [Projects.address, OperatorStore.address, TerminalDirectory.address],
  });

  console.log(`contract [ModStore] => ${chainId}`);
  const ModStore = await deploy('ModStore', {
    from: deployer,
    log: true,
    args: [Projects.address, OperatorStore.address, TerminalDirectory.address],
  });

  console.log(`contract [Prices] => ${chainId}`);
  const Prices = await deploy('Prices', { from: deployer, log: true, args: [] });

  console.log(`contract [TerminalV1] => ${chainId}`);
  const TerminalV1 = await deploy('TerminalV1', {
    from: deployer,
    log: true,
    args: [
      Projects.address,
      FundingCycles.address,
      TicketBooth.address,
      OperatorStore.address,
      ModStore.address,
      Prices.address,
      TerminalDirectory.address,
      /*_governance=*/ multisig,
    ],
  });

  console.log(`contract [TerminalV1_1] => ${chainId}`);
  const TerminalV1_1 = await deploy('TerminalV1_1', {
    from: deployer,
    log: true,
    args: [
      Projects.address,
      FundingCycles.address,
      TicketBooth.address,
      OperatorStore.address,
      ModStore.address,
      Prices.address,
      TerminalDirectory.address,
      /*_governance=*/ multisig,
    ],
  });

  console.log(`contract [TerminalV1Rescue] => ${chainId}`);
  const TerminalV1Rescue = await deploy('TerminalV1Rescue', {
    from: deployer,
    log: true,
    args: [
      Projects.address,
      FundingCycles.address,
      TicketBooth.address,
      OperatorStore.address,
      TerminalDirectory.address,
      /*_governance=*/ multisig,
    ],
  });

  console.log('ok');
  console.log(`TO VERIFY`);
  console.log(`npx hardhat run scripts/verifyAll.ts --network ${network.name}`);
};

export default fn;
export const tags = [
  'OperatorStore',
  'Projects',
  'TerminalDirectory',
  'FundingCycles',
  'TicketBooth',
  'ModStore',
  'Prices',
  'TerminalV1',
  'TerminalV1_1',
  'TerminalV1Rescue',
];
