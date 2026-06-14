// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title RemittanceVault
/// @notice Smart remittance vault. Sender locks stablecoins, recipient can
///         only claim each tranche after its scheduled release timestamp.
///         Sender can cancel any unreleased tranche and reclaim funds.
/// @dev    Celo-only. Legacy tx type only (no EIP-1559).
contract RemittanceVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Token addresses ───────────────────────────────────────────────────
    address public constant USDM = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant USDC = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C;
    address public constant USDT = 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e;

    // ── Schedule ──────────────────────────────────────────────────────────
    enum Interval { Weekly, BiWeekly, Monthly }

    struct Tranche {
        uint256 amount;       // raw token units
        uint256 releaseAt;    // unix timestamp when recipient can claim
        bool    claimed;
        bool    cancelled;
    }

    struct Schedule {
        address sender;
        address recipient;
        address token;
        uint8   decimals;
        Interval interval;
        Tranche[] tranches;
        bool    active;
        uint256 createdAt;
    }

    // scheduleId → Schedule
    mapping(uint256 => Schedule) private _schedules;
    uint256 public nextScheduleId;

    // user → scheduleIds they own (sender)
    mapping(address => uint256[]) public senderSchedules;
    // user → scheduleIds they receive
    mapping(address => uint256[]) public recipientSchedules;

    // ── Protocol fee (basis points, 0 = no fee) ───────────────────────────
    uint16  public feeBps;        // e.g. 30 = 0.3%
    address public feeRecipient;

    // ── Events ────────────────────────────────────────────────────────────
    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 totalAmount,
        uint256 trancheCount
    );
    event TrancheClaimed(
        uint256 indexed scheduleId,
        uint256 trancheIndex,
        address indexed recipient,
        uint256 amount
    );
    event TrancheCancelled(
        uint256 indexed scheduleId,
        uint256 trancheIndex,
        uint256 amountReturned
    );
    event ScheduleCancelledAll(uint256 indexed scheduleId, uint256 totalReturned);

    // ── Errors ────────────────────────────────────────────────────────────
    error UnsupportedToken(address token);
    error ZeroAmount();
    error ZeroAddress();
    error InvalidTranche();
    error NotYetReleasable(uint256 releaseAt, uint256 now_);
    error AlreadyClaimed();
    error AlreadyCancelled();
    error NotRecipient();
    error NotSender();
    error ScheduleNotActive();
    error TooManyTranches();

    uint256 private constant MAX_TRANCHES = 52; // max 1 year of weekly

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address initialOwner, address _feeRecipient) Ownable(initialOwner) {
        feeRecipient = _feeRecipient;
        feeBps = 30; // 0.3%
    }

    // ── Internal helpers ──────────────────────────────────────────────────
    function _supported(address token) internal pure returns (bool) {
        return token == USDM || token == USDC || token == USDT;
    }

    function _decimals(address token) internal pure returns (uint8) {
        return token == USDM ? 18 : 6;
    }

    function _intervalSeconds(Interval i) internal pure returns (uint256) {
        if (i == Interval.Weekly)   return 7 days;
        if (i == Interval.BiWeekly) return 14 days;
        return 30 days; // Monthly (approximate)
    }

    function _applyFee(uint256 amount) internal view returns (uint256 net, uint256 fee) {
        fee = (amount * feeBps) / 10_000;
        net = amount - fee;
    }

    // ── Core functions ────────────────────────────────────────────────────

    /// @notice Create a remittance schedule.
    /// @param recipient     Who receives the tranches.
    /// @param token         USDM / USDC / USDT.
    /// @param trancheAmount Raw token units per tranche.
    /// @param trancheCount  How many tranches (max 52).
    /// @param interval      Weekly / BiWeekly / Monthly.
    /// @param firstRelease  Unix timestamp of first release. 0 = immediately.
    function createSchedule(
        address   recipient,
        address   token,
        uint256   trancheAmount,
        uint8     trancheCount,
        Interval  interval,
        uint256   firstRelease
    ) external nonReentrant whenNotPaused returns (uint256 scheduleId) {
        if (!_supported(token)) revert UnsupportedToken(token);
        if (recipient == address(0)) revert ZeroAddress();
        if (trancheAmount == 0) revert ZeroAmount();
        if (trancheCount == 0 || trancheCount > MAX_TRANCHES) revert TooManyTranches();

        uint256 totalAmount = trancheAmount * trancheCount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        scheduleId = nextScheduleId++;
        Schedule storage s = _schedules[scheduleId];
        s.sender    = msg.sender;
        s.recipient = recipient;
        s.token     = token;
        s.decimals  = _decimals(token);
        s.interval  = interval;
        s.active    = true;
        s.createdAt = block.timestamp;

        uint256 intervalSec = _intervalSeconds(interval);
        uint256 release     = firstRelease > 0 ? firstRelease : block.timestamp;

        for (uint8 i = 0; i < trancheCount; i++) {
            s.tranches.push(Tranche({
                amount:    trancheAmount,
                releaseAt: release + (intervalSec * i),
                claimed:   false,
                cancelled: false
            }));
        }

        senderSchedules[msg.sender].push(scheduleId);
        recipientSchedules[recipient].push(scheduleId);

        emit ScheduleCreated(
            scheduleId, msg.sender, recipient, token, totalAmount, trancheCount
        );
    }

    /// @notice Claim a single releasable tranche.
    function claimTranche(uint256 scheduleId, uint256 trancheIndex)
        external
        nonReentrant
    {
        Schedule storage s = _schedules[scheduleId];
        if (!s.active) revert ScheduleNotActive();
        if (msg.sender != s.recipient) revert NotRecipient();
        if (trancheIndex >= s.tranches.length) revert InvalidTranche();

        Tranche storage t = s.tranches[trancheIndex];
        if (t.claimed)   revert AlreadyClaimed();
        if (t.cancelled) revert AlreadyCancelled();
        if (block.timestamp < t.releaseAt) {
            revert NotYetReleasable(t.releaseAt, block.timestamp);
        }

        t.claimed = true;

        (uint256 net, uint256 fee) = _applyFee(t.amount);
        if (fee > 0 && feeRecipient != address(0)) {
            IERC20(s.token).safeTransfer(feeRecipient, fee);
        }
        IERC20(s.token).safeTransfer(s.recipient, net);

        emit TrancheClaimed(scheduleId, trancheIndex, s.recipient, net);
    }

    /// @notice Cancel a single unclaimed tranche, returning funds to sender.
    function cancelTranche(uint256 scheduleId, uint256 trancheIndex)
        external
        nonReentrant
    {
        Schedule storage s = _schedules[scheduleId];
        if (msg.sender != s.sender) revert NotSender();
        if (trancheIndex >= s.tranches.length) revert InvalidTranche();

        Tranche storage t = s.tranches[trancheIndex];
        if (t.claimed)   revert AlreadyClaimed();
        if (t.cancelled) revert AlreadyCancelled();

        t.cancelled = true;
        IERC20(s.token).safeTransfer(s.sender, t.amount);

        emit TrancheCancelled(scheduleId, trancheIndex, t.amount);
    }

    /// @notice Cancel all remaining tranches in a schedule.
    function cancelSchedule(uint256 scheduleId) external nonReentrant {
        Schedule storage s = _schedules[scheduleId];
        if (msg.sender != s.sender) revert NotSender();
        if (!s.active) revert ScheduleNotActive();

        s.active = false;
        uint256 total;

        for (uint256 i = 0; i < s.tranches.length; i++) {
            Tranche storage t = s.tranches[i];
            if (!t.claimed && !t.cancelled) {
                t.cancelled = true;
                total += t.amount;
            }
        }

        if (total > 0) {
            IERC20(s.token).safeTransfer(s.sender, total);
        }

        emit ScheduleCancelledAll(scheduleId, total);
    }

    // ── View functions ────────────────────────────────────────────────────

    function getSchedule(uint256 scheduleId)
        external
        view
        returns (
            address sender,
            address recipient,
            address token,
            uint8   decimals_,
            bool    active,
            uint256 createdAt,
            uint256 trancheCount
        )
    {
        Schedule storage s = _schedules[scheduleId];
        return (
            s.sender, s.recipient, s.token, s.decimals,
            s.active, s.createdAt, s.tranches.length
        );
    }

    function getTranche(uint256 scheduleId, uint256 trancheIndex)
        external
        view
        returns (uint256 amount, uint256 releaseAt, bool claimed, bool cancelled)
    {
        Tranche storage t = _schedules[scheduleId].tranches[trancheIndex];
        return (t.amount, t.releaseAt, t.claimed, t.cancelled);
    }

    function getSenderSchedules(address sender) external view returns (uint256[] memory) {
        return senderSchedules[sender];
    }

    function getRecipientSchedules(address recipient) external view returns (uint256[] memory) {
        return recipientSchedules[recipient];
    }

    /// @notice Returns claimable amount across all schedules for a recipient.
    function claimableNow(address recipient)
        external
        view
        returns (uint256 totalClaimable)
    {
        uint256[] storage ids = recipientSchedules[recipient];
        for (uint256 i = 0; i < ids.length; i++) {
            Schedule storage s = _schedules[ids[i]];
            if (!s.active) continue;
            for (uint256 j = 0; j < s.tranches.length; j++) {
                Tranche storage t = s.tranches[j];
                if (!t.claimed && !t.cancelled && block.timestamp >= t.releaseAt) {
                    (uint256 net,) = _applyFee(t.amount);
                    totalClaimable += net;
                }
            }
        }
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setFee(uint16 bps, address recipient) external onlyOwner {
        require(bps <= 200, "max 2%");
        feeBps       = bps;
        feeRecipient = recipient;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
