// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract AgentNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    address public registry;
    address public factory;

    // ✅ FIX 1: Constructor accepts the Registry address
    constructor(address _registry) ERC721("AgentFi Identity", "AGFI") Ownable(msg.sender) {
        registry = _registry;
    }

    // ✅ FIX 2: Add setFactory function so the Deploy script can call it
    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }

    function mint(address to) external returns (uint256) {
        require(msg.sender == factory, "Only Factory can mint");
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
}