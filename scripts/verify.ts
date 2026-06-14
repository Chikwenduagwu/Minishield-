import hre from "hardhat";
const { run } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const addrPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addrPath)) {
    throw new Error("deployed-addresses.json not found. Run deploy.ts first.");
  }

  const { contracts, deployer } = JSON.parse(fs.readFileSync(addrPath, "utf8"));

  console.log("Verifying contracts on Celoscan...\n");

  // MiniShieldVault
  console.log("[1/3] Verifying MiniShieldVault...");
  await run("verify:verify", {
    address: contracts.MiniShieldVault,
    constructorArguments: [deployer],
    contract: "contracts/MiniShieldVault.sol:MiniShieldVault",
  });
  console.log("✓ MiniShieldVault verified");

  // RemittanceVault
  console.log("[2/3] Verifying RemittanceVault...");
  await run("verify:verify", {
    address: contracts.RemittanceVault,
    constructorArguments: [deployer, deployer],
    contract: "contracts/RemittanceVault.sol:RemittanceVault",
  });
  console.log("✓ RemittanceVault verified");

  // ShieldAgentRegistry
  console.log("[3/3] Verifying ShieldAgentRegistry...");
  await run("verify:verify", {
    address: contracts.ShieldAgentRegistry,
    constructorArguments: [deployer],
    contract: "contracts/ShieldAgentRegistry.sol:ShieldAgentRegistry",
  });
  console.log("✓ ShieldAgentRegistry verified");

  console.log("\nAll contracts verified on Celoscan ✓");
  console.log(`View at: https://celoscan.io/address/${contracts.MiniShieldVault}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
