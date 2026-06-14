// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title IIdentityRegistry — minimal ERC-8004 interface
interface IIdentityRegistry {
    function register(string calldata agentURI) external returns (uint256 agentId);
    function setMetadata(uint256 agentId, bytes32 key, string calldata value) external;
    function getMetadata(uint256 agentId, bytes32 key) external view returns (string memory);
    function ownerOf(uint256 agentId) external view returns (address);
    function getAgentWallet(uint256 agentId) external view returns (address);
    function setAgentWallet(
        uint256 agentId,
        address wallet,
        uint256 deadline,
        bytes calldata sig
    ) external;
}

/// @title IReputationRegistry — minimal ERC-8004 reputation interface
interface IReputationRegistry {
    function getSummary(uint256 agentId, address[] calldata clients)
        external
        view
        returns (uint256 count, int256 sum, uint8 decimals);
}

/// @title ShieldAgentRegistry
/// @notice Registers Shield AI as an ERC-8004 on-chain agent.
///         Called once at deploy time; agentId stored immutably.
///         Enables Celo Agent Visa and Onchain Agents Hackathon eligibility.
/// @dev    ERC-8004 Identity Registry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 (mainnet)
///         ERC-8004 Reputation Registry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 (mainnet)
contract ShieldAgentRegistry is Ownable {

    // ── ERC-8004 registry addresses (Celo Mainnet) ────────────────────────
    address public constant IDENTITY_REGISTRY   = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;
    address public constant REPUTATION_REGISTRY = 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63;

    // ── Agent state ───────────────────────────────────────────────────────
    uint256 public agentId;
    bool    public registered;
    string  public agentURI;

    // ── Events ────────────────────────────────────────────────────────────
    event AgentRegistered(uint256 indexed agentId, string agentURI);
    event AgentMetadataUpdated(bytes32 key, string value);
    event AgentWalletSet(address wallet);

    // ── Errors ────────────────────────────────────────────────────────────
    error AlreadyRegistered();
    error NotRegistered();
    error EmptyURI();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Register Shield AI on the ERC-8004 Identity Registry.
    /// @param  _agentURI  IPFS URI with spec-compliant metadata (ipfs://...).
    ///                    See ai-agents.md for the exact JSON shape required.
    function registerAgent(string calldata _agentURI) external onlyOwner {
        if (registered) revert AlreadyRegistered();
        if (bytes(_agentURI).length == 0) revert EmptyURI();

        agentURI = _agentURI;
        agentId  = IIdentityRegistry(IDENTITY_REGISTRY).register(_agentURI);
        registered = true;

        emit AgentRegistered(agentId, _agentURI);
    }

    /// @notice Set a key/value metadata field on the agent NFT.
    function setMetadata(bytes32 key, string calldata value) external onlyOwner {
        if (!registered) revert NotRegistered();
        IIdentityRegistry(IDENTITY_REGISTRY).setMetadata(agentId, key, value);
        emit AgentMetadataUpdated(key, value);
    }

    /// @notice Update the agent's payment wallet (requires owner signature).
    function setAgentWallet(address wallet, uint256 deadline, bytes calldata sig)
        external
        onlyOwner
    {
        if (!registered) revert NotRegistered();
        IIdentityRegistry(IDENTITY_REGISTRY).setAgentWallet(agentId, wallet, deadline, sig);
        emit AgentWalletSet(wallet);
    }

    // ── View helpers ──────────────────────────────────────────────────────

    function getMetadata(bytes32 key) external view returns (string memory) {
        if (!registered) revert NotRegistered();
        return IIdentityRegistry(IDENTITY_REGISTRY).getMetadata(agentId, key);
    }

    /// @notice Get agent reputation summary from the ERC-8004 Reputation Registry.
    function getReputation(address[] calldata clients)
        external
        view
        returns (uint256 count, int256 sum, uint8 decimals_)
    {
        if (!registered) revert NotRegistered();
        return IReputationRegistry(REPUTATION_REGISTRY).getSummary(agentId, clients);
    }

    /// @notice Convenience: returns the ERC-8004 agentId and registration URI.
    function agentInfo() external view returns (uint256 id, string memory uri, bool isRegistered) {
        return (agentId, agentURI, registered);
    }
}
