const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ShieldAgentRegistry with:", deployer.address);

  const Ag = await ethers.getContractFactory("ShieldAgentRegistry");
  const ag = await Ag.deploy(deployer.address);
  await ag.waitForDeployment();
  const agAddr = await ag.getAddress();
  console.log("ShieldAgentRegistry:", agAddr);

  require("fs").writeFileSync(
    "agent-registry.json",
    JSON.stringify({ ShieldAgentRegistry: agAddr }, null, 2)
  );
  console.log("Saved to agent-registry.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
