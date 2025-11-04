// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KasiKoin
 * @dev Implementation of a ZAR-pegged stablecoin with tipping and escrow functionality
 * Designed for township creators in South Africa
 */
contract KasiKoin is ERC20, Pausable, Ownable, ReentrancyGuard {
    // State variables
    mapping(address => bool) public verifiedCreators;
    mapping(address => uint256) public creatorTips;
    uint256 public constant MINIMUM_WITHDRAWAL = 10 * 10**18; // 10 KasiKoin (~ 10 ZAR)
    
    // Escrow structure
    struct Escrow {
        address creator;
        address client;
        uint256 amount;
        bool[] milestonesCompleted;
        bool finalized;
    }
    
    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    // Events
    event CreatorVerified(address indexed creator);
    event TipSent(address indexed from, address indexed to, uint256 amount);
    event EscrowCreated(uint256 indexed escrowId, address indexed creator, address indexed client, uint256 amount);
    event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneIndex);
    event EscrowFinalized(uint256 indexed escrowId);

    constructor() ERC20("KasiKoin", "KASI") {
        // Initialize contract
    }

    // Creator management
    function verifyCreator(address creator) external onlyOwner {
        require(!verifiedCreators[creator], "Creator already verified");
        verifiedCreators[creator] = true;
        emit CreatorVerified(creator);
    }

    // Minting function - restricted to owner (backed by ZAR reserves)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Tipping functionality
    function sendTip(address creator, uint256 amount) external nonReentrant whenNotPaused {
        require(verifiedCreators[creator], "Recipient is not a verified creator");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, creator, amount);
        creatorTips[creator] += amount;
        
        emit TipSent(msg.sender, creator, amount);
    }

    // Escrow functionality
    function createEscrow(address creator, uint256 amount, uint256 milestoneCount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256)
    {
        require(verifiedCreators[creator], "Recipient is not a verified creator");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(milestoneCount > 0, "Must have at least one milestone");

        uint256 escrowId = nextEscrowId++;
        bool[] memory milestonesCompleted = new bool[](milestoneCount);
        
        _transfer(msg.sender, address(this), amount);
        
        escrows[escrowId] = Escrow({
            creator: creator,
            client: msg.sender,
            amount: amount,
            milestonesCompleted: milestonesCompleted,
            finalized: false
        });

        emit EscrowCreated(escrowId, creator, msg.sender, amount);
        return escrowId;
    }

    function completeMilestone(uint256 escrowId, uint256 milestoneIndex) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.client, "Only client can complete milestone");
        require(!escrow.finalized, "Escrow already finalized");
        require(milestoneIndex < escrow.milestonesCompleted.length, "Invalid milestone index");
        require(!escrow.milestonesCompleted[milestoneIndex], "Milestone already completed");

        escrow.milestonesCompleted[milestoneIndex] = true;
        emit MilestoneCompleted(escrowId, milestoneIndex);

        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint256 i = 0; i < escrow.milestonesCompleted.length; i++) {
            if (!escrow.milestonesCompleted[i]) {
                allCompleted = false;
                break;
            }
        }

        // If all milestones are completed, release funds to creator
        if (allCompleted) {
            escrow.finalized = true;
            _transfer(address(this), escrow.creator, escrow.amount);
            emit EscrowFinalized(escrowId);
        }
    }

    // Withdrawal functionality
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MINIMUM_WITHDRAWAL, "Below minimum withdrawal amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        // Emit event for off-chain processing of ZAR withdrawal
        emit Transfer(msg.sender, address(0), amount);
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
