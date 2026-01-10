// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Registry.sol";
import "../src/AgentNFT.sol";
import "../src/AgentFactory.sol";
import "../src/AgentAccount.sol";

contract DeployScript is Script {
    function run() external {
        // 1. Load Private Key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start recording transactions
        vm.startBroadcast(deployerPrivateKey);

        // 2. Deploy Registry
        // (Note: In production, we might use the canonical ERC-6551 Registry, 
        // but for now, we deploy our own to ensure compatibility with your AgentAccount)
        Registry registry = new Registry();
        console.log("Registry deployed at:", address(registry));

        // 3. Deploy AgentNFT
        AgentNFT agentNFT = new AgentNFT(address(registry));
        console.log("AgentNFT deployed at:", address(agentNFT));

        // 4. Deploy AgentAccount Implementation
        AgentAccount implementation = new AgentAccount();
        console.log("AgentAccount Implementation deployed at:", address(implementation));

        // 5. Deploy AgentFactory
        AgentFactory factory = new AgentFactory(
            address(registry), 
            address(agentNFT), 
            address(implementation)
        );
        console.log("AgentFactory deployed at:", address(factory));

        // 6. Setup Permissions
        agentNFT.setFactory(address(factory));
        console.log("AgentNFT Factory set to:", address(factory));

        vm.stopBroadcast();
    }
}