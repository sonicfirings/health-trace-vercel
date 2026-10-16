// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChogGenesis {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @notice Stores public action proofs and Care XP against an existing Chog NFT.
/// Raw health data must remain offchain; proofId and summaryHash are opaque hashes.
contract TraceChogGuardian {
    // Shifts Unix weeks so each week starts Monday 00:00 GMT+8 (Sunday 16:00 UTC).
    uint256 private constant GMT8_MONDAY_OFFSET = 3 days + 8 hours;

    struct GuardianState {
        uint64 careXp;
        uint32 actionCount;
        uint32 lastClaimedWeek;
    }

    IChogGenesis public immutable chogGenesis;
    mapping(uint256 tokenId => GuardianState state) public guardians;
    mapping(bytes32 proofId => bool used) public usedProofs;

    event HealthyActionRecorded(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed proofId,
        uint16 careXp,
        uint8 level
    );
    event WeeklyProofClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        uint32 indexed weekIndex,
        bytes32 summaryHash,
        uint8 level
    );

    constructor(address chogGenesisAddress) {
        require(chogGenesisAddress != address(0), "invalid Chog collection");
        chogGenesis = IChogGenesis(chogGenesisAddress);
    }

    modifier onlyChogOwner(uint256 tokenId) {
        require(chogGenesis.ownerOf(tokenId) == msg.sender, "not Chog owner");
        _;
    }

    function recordAction(
        uint256 tokenId,
        bytes32 proofId,
        uint16 careXp
    ) external onlyChogOwner(tokenId) {
        require(!usedProofs[proofId], "proof already used");
        require(careXp > 0 && careXp <= 100, "invalid Care XP");

        usedProofs[proofId] = true;
        GuardianState storage guardian = guardians[tokenId];
        guardian.careXp += careXp;
        guardian.actionCount += 1;

        emit HealthyActionRecorded(tokenId, msg.sender, proofId, careXp, levelFor(guardian.careXp));
    }

    function claimWeeklyProof(
        uint256 tokenId,
        uint32 weekIndex,
        bytes32 summaryHash
    ) external onlyChogOwner(tokenId) {
        uint32 currentWeek = currentWeekIndex();
        require(weekIndex == currentWeek, "invalid week");
        require(guardians[tokenId].lastClaimedWeek < currentWeek, "week already claimed");
        require(summaryHash != bytes32(0), "empty summary");

        GuardianState storage guardian = guardians[tokenId];
        guardian.lastClaimedWeek = currentWeek;
        guardian.careXp += 60;

        emit WeeklyProofClaimed(tokenId, msg.sender, currentWeek, summaryHash, levelFor(guardian.careXp));
    }

    function currentWeekIndex() public view returns (uint32) {
        return uint32((block.timestamp + GMT8_MONDAY_OFFSET) / 1 weeks);
    }

    function levelFor(uint256 careXp) public pure returns (uint8) {
        uint256 calculated = (careXp / 100) + 1;
        return calculated > 6 ? 6 : uint8(calculated);
    }

    function badgeReady(uint256 tokenId) external view returns (bool) {
        return levelFor(guardians[tokenId].careXp) >= 6;
    }
}
