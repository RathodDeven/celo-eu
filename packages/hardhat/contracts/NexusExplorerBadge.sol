// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract NexusExplorerBadge is
    ERC721,
    ERC721URIStorage,
    ERC721Pausable,
    Ownable,
    ERC721Burnable
{
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("Nexus Explorer Badge", "NXEXP")
        Ownable(initialOwner)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Mint a badge to the recipient with the Nexus Explorer metadata
    /// @param to Recipient address
    function mintExplorerBadge(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, "ipfs://bafkreid2wtv65ife2zk2wic4exfn5whxk4gcy4ly4ybfvxuywjtvmips2e");
    }

    // Required Solidity overrides

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getNFTsByAddress(address owner) public view returns (uint256[] memory) {
        uint256 totalNFTs = _nextTokenId;
        uint256[] memory ownedTokenIds = new uint256[](totalNFTs);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTs; i++) {
            try ERC721(address(this)).ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    ownedTokenIds[currentIndex++] = i;
                }
            } catch {
                break;
            }
        }

        assembly {
            mstore(ownedTokenIds, currentIndex)
        }

        return ownedTokenIds;
    }
}
