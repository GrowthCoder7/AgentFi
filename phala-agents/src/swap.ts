import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // Uniswap V3 Router (Sepolia)
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";   // WETH9 (Sepolia)
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";    // UNI Token (Sepolia)
const POOL_FEE = 3000; // 0.3% Fee Tier

// --- ABIS ---

// 1. The Agent's Execute Function (Our Standard)
const AGENT_ABI = [
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

// 2. Uniswap V3 Router "exactInputSingle" Function
// This tells Uniswap: "Take exactly X ETH and give me as much UNI as possible."
const ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "tokenIn", "type": "address" },
          { "internalType": "address", "name": "tokenOut", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
          { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct ISwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

async function performSwap() {
    console.log("🦄 Preparing Uniswap V3 Trade...");

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });
    const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;

    // Amount to swap: 0.0001 ETH
    const amountIn = parseEther("0.0001");

    // 1. Encode the Uniswap Command
    // We are generating the data payload that tells the Router what to do.
    const swapData = encodeFunctionData({
        abi: ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
            tokenIn: WETH_ADDRESS,  // ETH is treated as WETH in the Router
            tokenOut: UNI_ADDRESS,  // We want UNI
            fee: POOL_FEE,          // 0.3% Pool
            recipient: AGENT_ADDRESS, // Send the UNI back to the Agent (not to you!)
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 10), // 10 minutes from now
            amountIn: amountIn,
            amountOutMinimum: 0n,   // Accept any amount (Slipage ignored for test)
            sqrtPriceLimitX96: 0n
        }]
    });

    console.log(`🔹 Swap Params Encoded. Trading 0.0001 ETH -> UNI`);

    // 2. Wrap it in the Agent's Execute Command
    // We tell the Agent: "Call the Router, send 0.0001 ETH, and give it this swap data."
    try {
        const hash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [
                ROUTER_ADDRESS, // Target: Uniswap Router
                amountIn,       // Value: Send the ETH along with the call
                swapData,       // Data: The encoded swap instructions
                0               // Operation: Call
            ]
        });

        console.log(`🚀 Swap Transaction Sent! Hash: ${hash}`);
        console.log("⏳ Waiting for Uniswap to process...");

        const receipt = await client.waitForTransactionReceipt({ hash });
        console.log(`✅ Trade Confirmed! Block: ${receipt.blockNumber}`);
        console.log("👉 Check your Agent's address on Sepolia Etherscan to see the UNI tokens.");

    } catch (error) {
        console.error("❌ Swap Failed:", error);
    }
}

performSwap();