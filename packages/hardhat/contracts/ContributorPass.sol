// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

interface INexusExplorerBadge {
    function referralCount(address user) external view returns (uint16);
    function hasMinted(address user) external view returns (bool);
}

contract ContributorPass is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721PausableUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 private _nextTokenId;
    string private _baseContributorURI;
    mapping(address => bool) public hasMinted;
    mapping(address => bool) public approvedMinters; // Admin approved addresses
    
    INexusExplorerBadge public nexusExplorerBadge;
    uint256 public celoRewardAmount;
    uint16 public minReferralCount;

    event ContributorPassClaimed(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 celoReward
    );
    
    event AdminApprovalGranted(
        address indexed user,
        address indexed admin
    );
    
    event AdminApprovalRevoked(
        address indexed user,
        address indexed admin
    );
    
    event CeloRewardUpdated(
        uint256 oldAmount,
        uint256 newAmount
    );
    
    event NexusExplorerBadgeAddressUpdated(
        address oldAddress,
        address newAddress
    );
    
    event MinReferralCountUpdated(
        uint16 oldCount,
        uint16 newCount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address _nexusExplorerBadgeAddress,
        uint256 _celoRewardAmount
    ) public initializer {
        __ERC721_init("Contributor Pass", "CTRBPASS");
        __ERC721URIStorage_init();
        __ERC721Pausable_init();
        __Ownable_init(initialOwner);
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        _baseContributorURI = "ipfs://bafybeihzduywnli2lgzde4t4cmc4ste2sgrcnag44bl5gq5eph6wtakfki";
        nexusExplorerBadge = INexusExplorerBadge(_nexusExplorerBadgeAddress);
        celoRewardAmount = _celoRewardAmount;
        minReferralCount = 2; // Default minimum referral count
        
        // Grant the contract deployer the default admin role and admin role
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
    }

    receive() external payable {
        // Allow contract to receive CELO
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Mint a ContributorPass with requirements checking
    function claimContributorPass() public nonReentrant {
        require(!hasMinted[msg.sender], "Already minted");
        require(nexusExplorerBadge.hasMinted(msg.sender), "Must own NexusExplorerBadge");
        
        // Check if user meets referral requirement OR is approved by admin
        bool hasEnoughReferrals = nexusExplorerBadge.referralCount(msg.sender) >= minReferralCount;
        bool isApproved = approvedMinters[msg.sender];
        
        require(
            hasEnoughReferrals || isApproved,
            "Must have 2+ referrals or admin approval"
        );
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _baseContributorURI);
        hasMinted[msg.sender] = true;
        
        // Transfer CELO reward if available
        if (celoRewardAmount > 0 && address(this).balance >= celoRewardAmount) {
            (bool success, ) = payable(msg.sender).call{value: celoRewardAmount}("");
            require(success, "CELO transfer failed");
        }
        
        // Remove admin approval after minting (one-time use)
        if (isApproved) {
            approvedMinters[msg.sender] = false;
        }
        
        emit ContributorPassClaimed(msg.sender, tokenId, celoRewardAmount);
    }

    /// @notice Admin function to approve an address for minting without referral requirement
    function approveForMinting(address user) public onlyRole(ADMIN_ROLE) {
        require(!hasMinted[user], "User already minted");
        require(!approvedMinters[user], "User already approved");
        
        approvedMinters[user] = true;
        emit AdminApprovalGranted(user, msg.sender);
    }

    /// @notice Admin function to revoke approval for minting
    function revokeApproval(address user) public onlyRole(ADMIN_ROLE) {
        require(approvedMinters[user], "User not approved");
        
        approvedMinters[user] = false;
        emit AdminApprovalRevoked(user, msg.sender);
    }

    /// @notice Admin function to update NexusExplorerBadge address
    function setNexusExplorerBadgeAddress(address _nexusExplorerBadgeAddress) public onlyRole(ADMIN_ROLE) {
        require(_nexusExplorerBadgeAddress != address(0), "Invalid address");
        
        address oldAddress = address(nexusExplorerBadge);
        nexusExplorerBadge = INexusExplorerBadge(_nexusExplorerBadgeAddress);
        
        emit NexusExplorerBadgeAddressUpdated(oldAddress, _nexusExplorerBadgeAddress);
    }

    /// @notice Admin function to update CELO reward amount
    function setCeloRewardAmount(uint256 _celoRewardAmount) public onlyRole(ADMIN_ROLE) {
        uint256 oldAmount = celoRewardAmount;
        celoRewardAmount = _celoRewardAmount;
        
        emit CeloRewardUpdated(oldAmount, _celoRewardAmount);
    }

    /// @notice Admin function to update minimum referral count required for minting
    function setMinReferralCount(uint16 _minReferralCount) public onlyRole(ADMIN_ROLE) {
        uint16 oldCount = minReferralCount;
        minReferralCount = _minReferralCount;
        
        emit MinReferralCountUpdated(oldCount, _minReferralCount);
    }

    /// @notice Admin function to withdraw CELO from contract
    function withdrawCelo(uint256 amount) public onlyRole(ADMIN_ROLE) nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "CELO withdrawal failed");
    }

    /// @notice Get contract CELO balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Check if address can mint (meets all requirements)
    function canMint(address user) public view returns (bool, string memory) {
        if (hasMinted[user]) {
            return (false, "Already minted");
        }
        
        if (!nexusExplorerBadge.hasMinted(user)) {
            return (false, "Must own NexusExplorerBadge");
        }
        
        bool hasEnoughReferrals = nexusExplorerBadge.referralCount(user) >= minReferralCount;
        bool isApproved = approvedMinters[user];
        
        if (!hasEnoughReferrals && !isApproved) {
            return (false, "Must have Enough referrals or admin approval");
        }
        
        return (true, "Can mint");
    }

    /// @notice Return all token IDs owned by an address
    function getNFTsByAddress(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        uint256 count = 0;
        uint256 total = _nextTokenId;

        for (uint256 i = 0; i < total; i++) {
            try this.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    result[count] = i;
                    count++;
                    if (count == balance) break;
                }
            } catch {
                // Token does not exist or was burned — skip
            }
        }

        return result;
    }

    /// @notice Override transfer to make soulbound (non-transferable)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Upgradeable, ERC721PausableUpgradeable) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from address(0)) and burning (to address(0)) but prevent transfers
        if (from != address(0) && to != address(0)) {
            revert("ContributorPass: soulbound token - transfers not allowed");
        }
        
        return super._update(to, tokenId, auth);
    }

    /// @notice Optional: allow admin to update the base URI
    function updateBaseContributorURI(string memory newUri) external onlyRole(ADMIN_ROLE) {
        _baseContributorURI = newUri;
    }

    // ───── Required Overrides ─────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
