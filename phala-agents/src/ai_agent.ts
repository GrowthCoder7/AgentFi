import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // SwapRouter02
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
const POOL_FEE = 3000;

// --- ABIS (Simplified for brevity) ---
const AGENT_ABI = [
  { inputs: [{name: "to", type: "address"}, {name: "value", type: "uint256"}, {name: "data", type: "bytes"}, {name: "operation", type: "uint8"}], name: "execute", outputs: [{name: "", type: "bytes"}], stateMutability: "payable", type: "function" }
] as const;
const WETH_ABI = [
    { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
    { inputs: [{name: "guy", type: "address"}, {name: "wad", type: "uint256"}], name: "approve", outputs: [{name: "", type: "bool"}], stateMutability: "nonpayable", type: "function" }
] as const;
const ROUTER_ABI = [
  { inputs: [{components: [{name: "tokenIn", type: "address"}, {name: "tokenOut", type: "address"}, {name: "fee", type: "uint24"}, {name: "recipient", type: "address"}, {name: "amountIn", type: "uint256"}, {name: "amountOutMinimum", type: "uint256"}, {name: "sqrtPriceLimitX96", type: "uint160"}], name: "params", type: "tuple"}], name: "exactInputSingle", outputs: [{name: "amountOut", type: "uint256"}], stateMutability: "payable", type: "function" }
] as const;

// --- 🧠 THE AI BRAIN (Simulation) ---
async function getAIDecision(marketData: string): Promise<boolean> {
    console.log(`\n🧠 AI is analyzing market data: "${marketData}"`);
    console.log("... thinking ...");
    
    // IN REAL WORLD: You would call OpenAI / Anthropic here.
    // const response = await openai.chat.completions.create({ ... })
    
    // SIMULATION: If the news mentions "Bullish", we buy.
    await new Promise(r => setTimeout(r, 2000)); // Simulate "Thinking" time
    
    if (marketData.toLowerCase().includes("bullish")) {
        console.log("💡 AI Decision: POSITIVE SIGNAL DETECTED. Executing Trade.");
        return true;
    } else {
        console.log("💡 AI Decision: Market unclear. HODL.");
        return false;
    }
}

// --- 🛠️ THE EXECUTION ARM (Reused Logic) ---
async function executeTrade(client: any, wallet: any) {
    const amountToSwap = parseEther("0.0001");

    // 1. Wrap
    console.log("   -> 1. Wrapping ETH...");
    const wrapData = encodeFunctionData({ abi: WETH_ABI, functionName: 'deposit' });
    const wrapHash = await wallet.writeContract({
        address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
        args: [WETH_ADDRESS, amountToSwap, wrapData, 0]
    });
    await client.waitForTransactionReceipt({ hash: wrapHash });

    // 2. Approve
    console.log("   -> 2. Approving Router...");
    const approveData = encodeFunctionData({ abi: WETH_ABI, functionName: 'approve', args: [ROUTER_ADDRESS, amountToSwap] });
    const approveHash = await wallet.writeContract({
        address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
        args: [WETH_ADDRESS, 0n, approveData, 0]
    });
    await client.waitForTransactionReceipt({ hash: approveHash });

    // 3. Swap
    console.log("   -> 3. Swapping for UNI...");
    const swapData = encodeFunctionData({
        abi: ROUTER_ABI, functionName: 'exactInputSingle',
        args: [{
            tokenIn: WETH_ADDRESS, tokenOut: UNI_ADDRESS, fee: POOL_FEE, recipient: AGENT_ADDRESS,
            amountIn: amountToSwap, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n
        }]
    });
    const swapHash = await wallet.writeContract({
        address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
        args: [ROUTER_ADDRESS, 0n, swapData, 0]
    });
    console.log(`   -> 🚀 ACTION COMPLETE: Tx ${swapHash}`);
}

// --- 🤖 MAIN AUTONOMOUS LOOP ---
async function runAutonomousAgent() {
    console.log("🕵️‍♂️ Starting Autonomous Agent Loop...");
    
    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    // SIMULATED FEED: In production, this comes from Twitter API or Price Feeds
    const marketFeeds = [
        "Market is boring today.",
        "Bitcoin is flat.",
        "BREAKING: Super Bullish news for DeFi tokens!",
        "Market crashing."
    ];

    // Run the loop
    for (const feed of marketFeeds) {
        const shouldTrade = await getAIDecision(feed);
        
        if (shouldTrade) {
            await executeTrade(client, wallet);
            break; // Stop after one trade for this demo
        }
    }
}

runAutonomousAgent();