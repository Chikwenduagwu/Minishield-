// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title MiniShieldVault
/// @notice Inflation protection vault. Users deposit USDm/USDC/USDT to
///         shield purchasing power. Tracks deposit time so the frontend can
///         display inflation-preservation stats vs local-currency alternatives.
/// @dev    Celo only. No EIP-1559 fields in transactions (legacy type only).
///         Fee abstraction (CIP-64) is handled at the wallet layer, not here.
contract MiniShieldVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Supported stablecoins (Celo Mainnet) ──────────────────────────────
    address public constant USDM  = 0x765DE816845861e75A25fCA122bb6898B8B1282a; // 18 dec
    address public constant USDC  = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C; //  6 dec
    address public constant USDT  = 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e; //  6 dec

    // ── x402 AI query price (in USDC, 6 decimals = $0.01) ────────────────
    uint256 public aiQueryPrice = 10_000; // 0.01 USDC
    address public aiRecipient;           // set by owner after deploy

    // ── Vault storage ─────────────────────────────────────────────────────
    struct VaultEntry {
        uint256 amount;       // raw token units
        uint256 depositedAt;  // block.timestamp
        uint8   decimals;     // token decimals cached
    }

    // user → token → VaultEntry
    mapping(address => mapping(address => VaultEntry)) public vaults;

    // ── x402 AI payment tracking ──────────────────────────────────────────
    mapping(address => uint256) public aiQueriesUsed;

    // ── Events ────────────────────────────────────────────────────────────
    event Deposited(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    event Withdrawn(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event AiQueryPaid(
        address indexed user,
        uint256 amount,
        uint256 queryIndex
    );
    event AiQueryPriceUpdated(uint256 newPrice);
    event AiRecipientUpdated(address newRecipient);

    // ── Errors ────────────────────────────────────────────────────────────
    error UnsupportedToken(address token);
    error InsufficientVaultBalance(uint256 have, uint256 need);
    error ZeroAmount();
    error ZeroAddress();
    error AiRecipientNotSet();

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ── Modifiers ─────────────────────────────────────────────────────────
    modifier onlySupported(address token) {
        if (token != USDM && token != USDC && token != USDT) {
            revert UnsupportedToken(token);
        }
        _;
    }

    // ── Internal helpers ──────────────────────────────────────────────────
    function _decimals(address token) internal pure returns (uint8) {
        if (token == USDM) return 18;
        return 6; // USDC + USDT
    }

    // ── Core vault functions ──────────────────────────────────────────────

    /// @notice Deposit stablecoins into the inflation-protection vault.
    /// @param token  One of USDM / USDC / USDT.
    /// @param amount Raw token units (respect each token's decimals).
    function deposit(address token, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        onlySupported(token)
    {
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        VaultEntry storage entry = vaults[msg.sender][token];
        // Weighted-average deposit time when topping up
        if (entry.amount > 0) {
            uint256 existingWeight = entry.amount * (block.timestamp - entry.depositedAt);
            uint256 totalAmount    = entry.amount + amount;
            entry.depositedAt = block.timestamp - (existingWeight / totalAmount);
        } else {
            entry.depositedAt = block.timestamp;
        }
        entry.amount   += amount;
        entry.decimals  = _decimals(token);

        emit Deposited(msg.sender, token, amount, block.timestamp);
    }

    /// @notice Withdraw stablecoins from the vault.
    /// @param token  One of USDM / USDC / USDT.
    /// @param amount Raw token units. Pass type(uint256).max to withdraw all.
    function withdraw(address token, uint256 amount)
        external
        nonReentrant
        onlySupported(token)
    {
        VaultEntry storage entry = vaults[msg.sender][token];

        uint256 toWithdraw = (amount == type(uint256).max) ? entry.amount : amount;
        if (toWithdraw == 0) revert ZeroAmount();
        if (entry.amount < toWithdraw) {
            revert InsufficientVaultBalance(entry.amount, toWithdraw);
        }

        entry.amount -= toWithdraw;
        if (entry.amount == 0) entry.depositedAt = 0;

        IERC20(token).safeTransfer(msg.sender, toWithdraw);
        emit Withdrawn(msg.sender, token, toWithdraw);
    }

    /// @notice Pay for an AI query via x402 micropayment pattern.
    ///         Caller pays aiQueryPrice USDC; Shield AI API validates on-chain.
    function payAiQuery() external nonReentrant whenNotPaused {
        if (aiRecipient == address(0)) revert AiRecipientNotSet();

        IERC20(USDC).safeTransferFrom(msg.sender, aiRecipient, aiQueryPrice);

        uint256 idx = ++aiQueriesUsed[msg.sender];
        emit AiQueryPaid(msg.sender, aiQueryPrice, idx);
    }

    // ── View functions ────────────────────────────────────────────────────

    /// @notice Returns vault balance and time held for a user+token pair.
    function getVault(address user, address token)
        external
        view
        returns (uint256 amount, uint256 depositedAt, uint8 decimals_)
    {
        VaultEntry storage e = vaults[user][token];
        return (e.amount, e.depositedAt, e.decimals);
    }

    /// @notice Returns all three vault positions for a user in one call.
    function getAllVaults(address user)
        external
        view
        returns (
            uint256 usdmAmount,   uint256 usdmDepositedAt,
            uint256 usdcAmount,   uint256 usdcDepositedAt,
            uint256 usdtAmount,   uint256 usdtDepositedAt
        )
    {
        VaultEntry storage eu = vaults[user][USDM];
        VaultEntry storage ec = vaults[user][USDC];
        VaultEntry storage et = vaults[user][USDT];
        return (
            eu.amount, eu.depositedAt,
            ec.amount, ec.depositedAt,
            et.amount, et.depositedAt
        );
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setAiQueryPrice(uint256 price) external onlyOwner {
        aiQueryPrice = price;
        emit AiQueryPriceUpdated(price);
    }

    function setAiRecipient(address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        aiRecipient = recipient;
        emit AiRecipientUpdated(recipient);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
