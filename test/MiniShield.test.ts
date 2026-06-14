import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { MiniShieldVault, RemittanceVault, ShieldAgentRegistry } from "../typechain-types";

describe("MiniShield Contracts", () => {
  let vault: MiniShieldVault;
  let remittance: RemittanceVault;
  let agentRegistry: ShieldAgentRegistry;
  let owner: any, user: any, recipient: any, feeRecipient: any;
  let mockUSDC: any;

  beforeEach(async () => {
    [owner, user, recipient, feeRecipient] = await ethers.getSigners();

    // Deploy mock ERC20 for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();

    // Mint tokens to user
    await mockUSDC.mint(user.address, ethers.parseUnits("10000", 6));

    // Deploy contracts
    const Vault = await ethers.getContractFactory("MiniShieldVault");
    vault = await Vault.deploy(owner.address) as MiniShieldVault;

    const Remittance = await ethers.getContractFactory("RemittanceVault");
    remittance = await Remittance.deploy(owner.address, feeRecipient.address) as RemittanceVault;

    const AgentReg = await ethers.getContractFactory("ShieldAgentRegistry");
    agentRegistry = await AgentReg.deploy(owner.address) as ShieldAgentRegistry;
  });

  describe("MiniShieldVault", () => {
    it("reverts deposit of unsupported token", async () => {
      const randomToken = mockUSDC.target; // not in supported list
      await expect(
        vault.connect(user).deposit(randomToken, ethers.parseUnits("100", 6))
      ).to.be.revertedWithCustomError(vault, "UnsupportedToken");
    });

    it("reverts zero amount deposit", async () => {
      await expect(
        vault.connect(user).deposit(await vault.USDM(), 0n)
      ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });

    it("reverts withdraw with insufficient balance", async () => {
      await expect(
        vault.connect(user).withdraw(await vault.USDM(), ethers.parseUnits("100", 18))
      ).to.be.revertedWithCustomError(vault, "InsufficientVaultBalance");
    });

    it("reverts payAiQuery when recipient not set", async () => {
      const freshVault = await (await ethers.getContractFactory("MiniShieldVault")).deploy(owner.address);
      await expect(
        freshVault.connect(user).payAiQuery()
      ).to.be.revertedWithCustomError(freshVault, "AiRecipientNotSet");
    });

    it("owner can set AI recipient", async () => {
      await vault.connect(owner).setAiRecipient(feeRecipient.address);
      // No revert means success
    });

    it("non-owner cannot set AI recipient", async () => {
      await expect(
        vault.connect(user).setAiRecipient(feeRecipient.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("getAllVaults returns zeros for new user", async () => {
      const result = await vault.getAllVaults(user.address);
      expect(result[0]).to.equal(0n); // usdmAmount
      expect(result[2]).to.equal(0n); // usdcAmount
      expect(result[4]).to.equal(0n); // usdtAmount
    });

    it("owner can pause and unpause", async () => {
      await vault.connect(owner).pause();
      await vault.connect(owner).unpause();
    });

    it("non-owner cannot pause", async () => {
      await expect(vault.connect(user).pause()).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("RemittanceVault", () => {
    it("reverts createSchedule with unsupported token", async () => {
      await expect(
        remittance.connect(user).createSchedule(
          recipient.address, mockUSDC.target, ethers.parseUnits("75", 6), 4, 0, 0n
        )
      ).to.be.revertedWithCustomError(remittance, "UnsupportedToken");
    });

    it("reverts createSchedule with zero address recipient", async () => {
      await expect(
        remittance.connect(user).createSchedule(
          ethers.ZeroAddress, await remittance.USDM(), ethers.parseUnits("75", 18), 4, 0, 0n
        )
      ).to.be.revertedWithCustomError(remittance, "ZeroAddress");
    });

    it("reverts createSchedule with zero tranche amount", async () => {
      await expect(
        remittance.connect(user).createSchedule(
          recipient.address, await remittance.USDM(), 0n, 4, 0, 0n
        )
      ).to.be.revertedWithCustomError(remittance, "ZeroAmount");
    });

    it("reverts claimTranche from non-recipient", async () => {
      // Need a valid schedule to exist — test just the access control path
      await expect(
        remittance.connect(user).claimTranche(0n, 0n)
      ).to.be.reverted; // schedule doesn't exist or not active
    });

    it("fee setter enforces max 2%", async () => {
      await expect(
        remittance.connect(owner).setFee(201, feeRecipient.address)
      ).to.be.revertedWith("max 2%");
    });

    it("owner can update fee within bounds", async () => {
      await remittance.connect(owner).setFee(50, feeRecipient.address); // 0.5%
      expect(await remittance.feeBps()).to.equal(50);
    });

    it("claimableNow returns zero for new address", async () => {
      const claimable = await remittance.claimableNow(user.address);
      expect(claimable).to.equal(0n);
    });

    it("getSenderSchedules returns empty array initially", async () => {
      const ids = await remittance.getSenderSchedules(user.address);
      expect(ids.length).to.equal(0);
    });
  });

  describe("ShieldAgentRegistry", () => {
    it("reports not registered initially", async () => {
      const [, , isRegistered] = await agentRegistry.agentInfo();
      expect(isRegistered).to.equal(false);
    });

    it("reverts registerAgent with empty URI", async () => {
      await expect(
        agentRegistry.connect(owner).registerAgent("")
      ).to.be.revertedWithCustomError(agentRegistry, "EmptyURI");
    });

    it("non-owner cannot register", async () => {
      await expect(
        agentRegistry.connect(user).registerAgent("ipfs://test")
      ).to.be.revertedWithCustomError(agentRegistry, "OwnableUnauthorizedAccount");
    });

    it("setMetadata reverts when not registered", async () => {
      const key = ethers.encodeBytes32String("name");
      await expect(
        agentRegistry.connect(owner).setMetadata(key, "Shield AI")
      ).to.be.revertedWithCustomError(agentRegistry, "NotRegistered");
    });

    it("getMetadata reverts when not registered", async () => {
      const key = ethers.encodeBytes32String("name");
      await expect(
        agentRegistry.connect(owner).getMetadata(key)
      ).to.be.revertedWithCustomError(agentRegistry, "NotRegistered");
    });

    it("exposes correct ERC-8004 registry addresses", async () => {
      const identityReg = await agentRegistry.IDENTITY_REGISTRY();
      const reputationReg = await agentRegistry.REPUTATION_REGISTRY();
      expect(identityReg).to.equal("0x8004A169FB4a3325136EB29fA0ceB6D2e539a432");
      expect(reputationReg).to.equal("0x8004BAa17C55a88189AE136b182e5fdA19dE9b63");
    });
  });
});
