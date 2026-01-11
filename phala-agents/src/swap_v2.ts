import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // SwapRouter02 (Sepolia)
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";   // WETH9
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";    // UNI Token
const POOL_FEE = 3000; // 0.3%

// --- ABIS ---
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

const WETH_ABI = [
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "guy", "type": "address" },
            { "internalType": "uint256", "name": "wad", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// UPDATED: SwapRouter02 ABI (No Deadline in Params)
const ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "tokenIn", "type": "address" },
          { "internalType": "address", "name": "tokenOut", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          // NOTE: 'deadline' is REMOVED for SwapRouter02
          { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
          { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct IV3SwapRouter.ExactInputSingleParams",
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

async function performRobustSwap() {
    console.log("🦄 Starting DeFi Protocol (SwapRouter02 Edition)...");

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });
    const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
    const amountToSwap = parseEther("0.0001");

    // --- STEP 1: WRAP ETH ---
    console.log("\n📦 Step 1: Wrapping ETH...");
    // (We can skip or re-run this, it's safe to wrap more)
    const wrapData = encodeFunctionData({ abi: WETH_ABI, functionName: 'deposit' });
    const wrapHash = await wallet.writeContract({
        address: AGENT_ADDRESS,
        abi: AGENT_ABI,
        functionName: 'execute',
        args: [WETH_ADDRESS, amountToSwap, wrapData, 0]
    });
    console.log(`   -> Wrap Tx: ${wrapHash}`);
    await client.waitForTransactionReceipt({ hash: wrapHash });
    console.log("   ✅ ETH Wrapped.");

    // --- STEP 2: APPROVE ROUTER ---
    console.log("\n👍 Step 2: Approving Router...");
    const approveData = encodeFunctionData({
        abi: WETH_ABI,
        functionName: 'approve',
        args: [ROUTER_ADDRESS, amountToSwap]
    });
    const approveHash = await wallet.writeContract({
        address: AGENT_ADDRESS,
        abi: AGENT_ABI,
        functionName: 'execute',
        args: [WETH_ADDRESS, 0n, approveData, 0]
    });
    console.log(`   -> Approve Tx: ${approveHash}`);
    await client.waitForTransactionReceipt({ hash: approveHash });
    console.log("   ✅ Approved.");

    // --- STEP 3: EXECUTE SWAP ---
    console.log("\n🚀 Step 3: Executing Swap on SwapRouter02...");
    
    // Updated Args: No Deadline!
    const swapData = encodeFunctionData({
        abi: ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
            tokenIn: WETH_ADDRESS,
            tokenOut: UNI_ADDRESS,
            fee: POOL_FEE,
            recipient: AGENT_ADDRESS,
            // deadline: REMOVED
            amountIn: amountToSwap,
            amountOutMinimum: 0n,
            sqrtPriceLimitX96: 0n
        }]
    });

    try {
        const swapHash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [ROUTER_ADDRESS, 0n, swapData, 0]
        });
        console.log(`   -> Swap Tx Sent: ${swapHash}`);
        
        const receipt = await client.waitForTransactionReceipt({ hash: swapHash });
        console.log(`\n🏆 SUCCESS! Tx Confirmed in block ${receipt.blockNumber}`);
        console.log(`👉 View on Etherscan: https://sepolia.etherscan.io/tx/${swapHash}`);
    } catch (e) {
        console.error("❌ Swap Failed:", e);
    }
}

performRobustSwap();