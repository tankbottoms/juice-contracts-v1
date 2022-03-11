import { TransactionResponse } from 'ethers/node_modules/@ethersproject/abstract-provider';
import { ethers, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';

const fn: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let chainId = await getChainId();

  let chain: string;
  let multisig: string;

  console.log({ chainId, d: deployer });

  switch (chainId) {
    // polygon (matic)
    case '137':
      chain = 'matic';
      multisig = '0x312e53eA23d40c65f8E21e5896a0cc55dF4F8E09';
      break;
    // mumbai (matic testnet)
    case '80001':
      chain = 'mumbai';
      multisig = deployer;
      break;
    default:
      throw new Error(`Chain id ${chainId} not supported`);
  }

  console.log({ chain, owner: multisig });

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

  const prices = new ethers.Contract(Prices.address, Prices.abi, (await ethers.getSigners())[0]);

  const feed =
    chainId == '137' // matic
      ? '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'
      : chainId == '80001' // mumbai
      ? '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'
      : '';
  if (feed) {
    const tx: TransactionResponse = await prices.addFeed(feed, 1, {
      gasLimit: ethers.BigNumber.from('2100000'),
    });
    console.log(`adding price feed ${feed} ...`);
    await tx.wait(2);
  }

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
