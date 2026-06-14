
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(bal), 'CELO');

  const Vault = await ethers.getContractFactory('MiniShieldVault');
  const vault = await Vault.deploy(deployer.address);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log('MiniShieldVault:', vaultAddr);
  await vault.setAiRecipient(deployer.address);

  const Rem = await ethers.getContractFactory('RemittanceVault');
  const rem = await Rem.deploy(deployer.address, deployer.address);
  await rem.waitForDeployment();
  const remAddr = await rem.getAddress();
  console.log('RemittanceVault:', remAddr);

  const Ag = await ethers.getContractFactory('ShieldAgentRegistry');
  const ag = await Ag.deploy(deployer.address);
  await ag.waitForDeployment();
  const agAddr = await ag.getAddress();
  console.log('ShieldAgentRegistry:', agAddr);

  const out = JSON.stringify({ MiniShieldVault: vaultAddr, RemittanceVault: remAddr, ShieldAgentRegistry: agAddr }, null, 2);
  require('fs').writeFileSync('deployed-addresses.json', out);
  console.log('Done! Addresses saved.');
  console.log('VAULT=' + vaultAddr);
  console.log('REMITTANCE=' + remAddr);
  console.log('AGENT=' + agAddr);
}

main().catch(e => { console.error(e); process.exit(1); });
