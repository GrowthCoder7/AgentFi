import { createPublicClient, createWalletClient, http, hexToBigInt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// Standard ERC-6551 Account Interface (The "Skeleton" of your Agent)
const ERC6551_ABI = [
  {
    "inputs": [],
    "name": "token",
    "outputs": [
        { "internalType": "uint256", "name": "chainId", "type": "uint256" },
        { "internalType": "address", "name": "tokenContract", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" },
        { "internalType": "bytes", "name": "data", "type": "bytes" },
        { "internalType": "uint8", "name": "operation", "type": "uint8" }
    ],
    "name": "execute",
    "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

async function diagnoseAgent() {
    console.log("🕵️‍♂️ Starting Agent Diagnosis...");

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
    console.log(`🔑 Operator: ${account.address}`);
    console.log(`🏦 Agent:    ${AGENT_ADDRESS}\n`);

    // TEST 1: Check Ownership
    try {
        const owner = await client.readContract({
            address: AGENT_ADDRESS,
            abi: ERC6551_ABI,
            functionName: 'owner',
        });
        console.log(`✅ TEST 1 (Ownership): Agent is owned by: ${owner}`);
        
        if (owner.toLowerCase() === account.address.toLowerCase()) {
            console.log("   -> MATCH! You are the owner.");
        } else {
            console.log("   -> ⚠️ MISMATCH! You are NOT the owner.");
        }
    } catch (e) {
        console.log("❌ TEST 1 Failed: Could not read 'owner'.");
    }

    // TEST 2: Basic Execution (Ping)
    // We try to send 0 ETH to ourselves via the Agent.
    // If this works, the Agent is functional and you have control.
    try {
        console.log("\n🔄 TEST 2 (Control): Attempting a 0 ETH self-transfer...");
        
        const hash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: ERC6551_ABI,
            functionName: 'execute',
            args: [
                account.address, // Send to Operator
                hexToBigInt("0x0"), // 0 ETH
                "0x", // No Data
                0 // Call
            ]
        });
        console.log(`   -> Transaction Sent: ${hash}`);
        await client.waitForTransactionReceipt({ hash });
        console.log("✅ TEST 2 Passed: You have full control over this Agent.");
    } catch (e) {
        console.log("❌ TEST 2 Failed: 'execute' reverted.");
        console.log("   -> This means you likely do not have permission to drive this Agent.");
    }

    console.log("\n📋 Diagnosis Complete.");
}

diagnoseAgent();