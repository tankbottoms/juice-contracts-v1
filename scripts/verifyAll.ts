import { ethers, network, run } from 'hardhat';
import { readdirSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const dirname = resolve(__dirname, `../deployments/${network.name}/`);
  const files = readdirSync(dirname, {
    withFileTypes: true,
  })
    .filter((filename) => filename.name.endsWith('.json'))
    .map(({ name }) => [name.replace('.json', ''), resolve(dirname, `./${name}`)]);
  for (const [name, pathname] of files) {
    const info = require(pathname);
    console.log(`verify ${name}...`);
    try {
      await run('verify:verify', {
        address: info.address,
        constructorArguments: info.args,
      });
      console.log(`contract ${name} is verified`);
    } catch (error: any) {
        console.log(error.message);
    }
  }
}

main();
