// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Registry.sol";

interface IAgentToken {
    // We match the new function signature from Step 1
    function mint(address to) external returns (uint256);
}

contract AgentFactory {
    Registry public registry;
    IAgentToken public token;
    address public implementation;

    event AgentCreated(address indexed user, uint256 indexed tokenId, address agentWallet);

    constructor(address _registry, address _token, address _implementation) {
        registry = Registry(_registry);
        token = IAgentToken(_token);
        implementation = _implementation;
    }

    function createAgent() external returns (address agentWallet, uint256 tokenId) {
        // 1. Mint the NFT to the User
        tokenId = token.mint(msg.sender);

        // 2. Deploy the Agent Wallet via Registry
        agentWallet = registry.createAccount(
            implementation,
            31337,           // ChainID (Anvil)
            address(token),  // Token Contract
            tokenId,         // Token ID
            tokenId,         // Salt (using TokenID keeps it simple)
            ""               // No Init Data
        );

        emit AgentCreated(msg.sender, tokenId, agentWallet);
    }
}