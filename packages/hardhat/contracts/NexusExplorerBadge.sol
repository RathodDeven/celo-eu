// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NexusExplorerBadge is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721PausableUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable
{
    uint256 private _nextTokenId;
    string private _baseBadgeURI;
    mapping(address => bool) public hasMinted;

    event ExplorerBadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner
    ) public initializer {
        __ERC721_init("Nexus Explorer Badge", "NXEXP");
        __ERC721URIStorage_init();
        __ERC721Pausable_init();
        __Ownable_init(initialOwner);
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        
        _baseBadgeURI = "ipfs://bafkreid2wtv65ife2zk2wic4exfn5whxk4gcy4ly4ybfvxuywjtvmips2e";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Mint a badge to the recipient with predefined metadata
    function mintExplorerBadge() public {
        require(!hasMinted[msg.sender], "Already minted");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _baseBadgeURI);
        hasMinted[msg.sender] = true;
        emit ExplorerBadgeMinted(msg.sender, tokenId);
    }

    /// @notice Admin function to mint a badge to a specific recipient
    function mintExplorerBadge(address recipient) public onlyOwner {
        require(!hasMinted[recipient], "Recipient already minted");
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _baseBadgeURI);
        hasMinted[recipient] = true;
        emit ExplorerBadgeMinted(recipient, tokenId);
    }

    /// @notice Return all token IDs owned by an address
    function getNFTsByAddress(
        address owner
    ) public view returns (uint256[] memory) {
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

    /// Optional: allow the owner to update the base URI
    function updateBaseBadgeURI(string memory newUri) external onlyOwner {
        _baseBadgeURI = newUri;
    }    // ───── Required Overrides ─────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Upgradeable, ERC721PausableUpgradeable) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Call parent _update first
        address result = super._update(to, tokenId, auth);
        
        // Reset hasMinted for the previous owner if they no longer own any badges
        if (from != address(0) && from != to) {
            if (balanceOf(from) == 0) {
                hasMinted[from] = false;
            }
        }
        
        return result;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
