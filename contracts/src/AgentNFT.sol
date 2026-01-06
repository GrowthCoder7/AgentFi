// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("AgentFi Alpha", "AGENT") Ownable(msg.sender) {}

    // CHANGED: Accepts 'to' address, returns 'tokenId'
    function mint(address to) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }
}