import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MiniShield contracts...");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CELO");

  // ── 1. MiniShieldVault ──────────────────────────────────────────────────
  console.log("\n[1/3] Deploying MiniShieldVault...");
  const Vault = await ethers.getContractFactory("MiniShieldVault");
  const vault = await Vault.deploy(deployer.address);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("✓ MiniShieldVault:", vaultAddr);

  // Set AI recipient to deployer initially (update post-deploy)
  await vault.setAiRecipient(deployer.address);
  console.log("  AI recipient set to deployer (update with setAiRecipient)");

  // ── 2. RemittanceVault ──────────────────────────────────────────────────
  console.log("\n[2/3] Deploying RemittanceVault...");
  const Remittance = await ethers.getContractFactory("RemittanceVault");
  const remittance = await Remittance.deploy(deployer.address, deployer.address);
  await remittance.waitForDeployment();
  const remittanceAddr = await remittance.getAddress();
  console.log("✓ RemittanceVault:", remittanceAddr);

  // ── 3. ShieldAgentRegistry ─────────────────────────────────────────────
  console.log("\n[3/3] Deploying ShieldAgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("ShieldAgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(deployer.address);
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log("✓ ShieldAgentRegistry:", agentRegistryAddr);

  // ── Save addresses ──────────────────────────────────────────────────────
  const network = await ethers.provider.getNetwork();
  const addresses = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MiniShieldVault: vaultAddr,
      RemittanceVault: remittanceAddr,
      ShieldAgentRegistry: agentRegistryAddr,
    },
  };

  const outPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\n✓ Addresses saved to deployed-addresses.json");

  // ── Print env vars to copy ─────────────────────────────────────────────
  console.log("\n── Add to .env ──────────────────────────────────");
  console.log(`NEXT_PUBLIC_VAULT_CONTRACT=${vaultAddr}`);
  console.log(`NEXT_PUBLIC_REMITTANCE_CONTRACT=${remittanceAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY_CONTRACT=${agentRegistryAddr}`);
  console.log("─────────────────────────────────────────────────");

  console.log("\nNext steps:");
  console.log("1. Verify contracts: npx hardhat run scripts/verify.ts --network celo");
  console.log("2. Register ERC-8004 agent: call agentRegistry.registerAgent(ipfsURI)");
  console.log("3. Update NEXT_PUBLIC_* env vars in your deployment platform");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
