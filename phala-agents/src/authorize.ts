import { createPublicClient, createWalletClient, http, encodeFunctionData, hexToBigInt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// CONFIGURATION
const PHALA_WORKER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 

// 👇 UPDATED ABI: Using the SINGULAR version (address, bool)
const AGENT_ABI_SINGULAR = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" },
      { "internalType": "uint8", "name": "operation", "type": "uint8" }
    ],
    "name": "execute",
    "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "signer", "type": "address" },     // 👈 Single Address
      { "internalType": "bool", "name": "permission", "type": "bool" }         // 👈 Single Bool
    ],
    "name": "setPermissions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

async function authorizeAgent() {
    console.log("🛡️  Initializing Authorization Protocol (Singular Mode)...");

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
    console.log(`🔑 Operator: ${account.address}`);
    console.log(`🏦 Agent:    ${AGENT_ADDRESS}`);

    try {
        console.log("\nAttempting Self-Execution (Singular)...");
        
        // 1. Encode the permission payload (SINGULAR)
        const permissionData = encodeFunctionData({
            abi: AGENT_ABI_SINGULAR,
            functionName: 'setPermissions',
            args: [PHALA_WORKER_ADDRESS, true] // 👈 No extra brackets!
        });

        // 2. Wrap it in execute
        const hash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI_SINGULAR,
            functionName: 'execute',
            args: [
                AGENT_ADDRESS, // Target: The Agent calls itself
                hexToBigInt("0x0"), // Value: 0
                permissionData, // Data: The singular payload
                0 // Operation: 0 (Call)
            ]
        });

        console.log(`🚀 Transaction Sent! Hash: ${hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await client.waitForTransactionReceipt({ hash });
        
        if (receipt.status === 'success') {
            console.log("✅ SUCCESS! Agent Authorized.");
        } else {
            console.log("❌ Transaction mined but failed.");
        }

    } catch (e) {
        console.log("❌ Authorization Failed.");
        console.error(e);
    }
}

authorizeAgent();