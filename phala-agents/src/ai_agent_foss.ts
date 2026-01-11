// import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, formatEther } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { sepolia } from 'viem/chains';
// import dotenv from 'dotenv';

// dotenv.config();

// // --- CONFIGURATION ---
// const OLLAMA_ENDPOINT = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
// const MODEL_NAME = "llama3.2"; 
// const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

// const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
// const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // SwapRouter02
// const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
// const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
// const POOL_FEE = 3000;

// // --- ABIS ---
// const AGENT_ABI = [
//   { inputs: [{name: "to", type: "address"}, {name: "value", type: "uint256"}, {name: "data", type: "bytes"}, {name: "operation", type: "uint8"}], name: "execute", outputs: [{name: "", type: "bytes"}], stateMutability: "payable", type: "function" }
// ] as const;
// const WETH_ABI = [
//     { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
//     { inputs: [{name: "guy", type: "address"}, {name: "wad", type: "uint256"}], name: "approve", outputs: [{name: "", type: "bool"}], stateMutability: "nonpayable", type: "function" }
// ] as const;
// const ROUTER_ABI = [
//   { inputs: [{components: [{name: "tokenIn", type: "address"}, {name: "tokenOut", type: "address"}, {name: "fee", type: "uint24"}, {name: "recipient", type: "address"}, {name: "amountIn", type: "uint256"}, {name: "amountOutMinimum", type: "uint256"}, {name: "sqrtPriceLimitX96", type: "uint160"}], name: "params", type: "tuple"}], name: "exactInputSingle", outputs: [{name: "amountOut", type: "uint256"}], stateMutability: "payable", type: "function" }
// ] as const;

// // --- 🌐 REAL WORLD DATA FETCHING ---
// async function fetchRealMarketData(): Promise<string> {
//     try {
//         console.log("🌐 Fetching live market data from Coingecko...");
//         const response = await fetch(COINGECKO_API);
//         const data = await response.json();
        
//         // Extract ETH data
//         const ethPrice = data.ethereum.usd;
//         const ethChange = data.ethereum.usd_24h_change;

//         // Create a narrative for the AI
//         let narrative = `Ethereum current price is $${ethPrice}. `;
//         if (ethChange > 0) {
//             narrative += `The market is up by ${ethChange.toFixed(2)}% in the last 24 hours. Bullish momentum.`;
//         } else {
//             narrative += `The market is down by ${ethChange.toFixed(2)}% in the last 24 hours. Bearish pressure.`;
//         }
        
//         return narrative;
//     } catch (error) {
//         console.error("❌ API Error:", error);
//         return "Market data unavailable.";
//     }
// }

// // --- 🧠 AI BRAIN ---
// async function getFossAIDecision(marketData: string): Promise<boolean> {
//     console.log(`\n🧠 Sending data to Local Llama 3: "${marketData}"`);

//     // We trick the AI into being a momentum trader
//     const prompt = `
//     You are an aggressive DeFi Trading Agent. 
    
//     MARKET REPORT: "${marketData}"
    
//     STRATEGY:
//     - If market is UP or showing Bullish momentum -> YES (Buy).
//     - If market is DOWN or Bearish -> NO (Hold).
    
//     DECISION (Strictly YES or NO):
//     `;

//     try {
//         const response = await fetch(OLLAMA_ENDPOINT, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 model: MODEL_NAME,
//                 prompt: prompt,
//                 stream: false
//             })
//         });

//         const json = await response.json();
//         if (json.error || !json.response) return false;

//         const decision = json.response.trim().toUpperCase();
//         console.log(`💡 Llama Decision: [${decision}]`);

//         if (decision.includes("YES")) return true;
//     } catch (error) {
//         console.error("❌ AI Error:", error);
//     }
//     return false;
// }

// // --- 🛠️ EXECUTION ARM ---
// async function executeTrade(client: any, wallet: any) {
//     const amountToSwap = parseEther("0.0001");
//     console.log("   -> ⚡ Executing Live Trade...");

//     // 1. Wrap
//     const wrapData = encodeFunctionData({ abi: WETH_ABI, functionName: 'deposit' });
//     const wrapHash = await wallet.writeContract({
//         address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
//         args: [WETH_ADDRESS, amountToSwap, wrapData, 0]
//     });
//     await client.waitForTransactionReceipt({ hash: wrapHash });

//     // 2. Approve
//     const approveData = encodeFunctionData({ abi: WETH_ABI, functionName: 'approve', args: [ROUTER_ADDRESS, amountToSwap] });
//     const approveHash = await wallet.writeContract({
//         address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
//         args: [WETH_ADDRESS, 0n, approveData, 0]
//     });
//     await client.waitForTransactionReceipt({ hash: approveHash });

//     // 3. Swap
//     const swapData = encodeFunctionData({
//         abi: ROUTER_ABI, functionName: 'exactInputSingle',
//         args: [{
//             tokenIn: WETH_ADDRESS, tokenOut: UNI_ADDRESS, fee: POOL_FEE, recipient: AGENT_ADDRESS,
//             amountIn: amountToSwap, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n
//         }]
//     });
//     const swapHash = await wallet.writeContract({
//         address: AGENT_ADDRESS, abi: AGENT_ABI, functionName: 'execute',
//         args: [ROUTER_ADDRESS, 0n, swapData, 0]
//     });
//     console.log(`   🚀 LIVE SWAP CONFIRMED: https://sepolia.etherscan.io/tx/${swapHash}`);
// }

// // --- 🤖 MAIN LOOP ---
// async function runFossAgent() {
//     console.log("🐧 Starting Real-World AI Agent...");
    
//     if (!process.env.OPERATOR_PRIVATE_KEY) {
//         console.error("❌ Key missing.");
//         process.exit(1);
//     }

//     const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
//     const client = createPublicClient({ chain: sepolia, transport: http() });
//     const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

//     // 1. Fetch REAL Data
//     const liveMarketData = await fetchRealMarketData();

//     // 2. Ask AI
//     const shouldTrade = await getFossAIDecision(liveMarketData);

//     // 3. Act
//     if (shouldTrade) {
//         console.log("✅ Market conditions favorable. Trading...");
//         await executeTrade(client, wallet);
//     } else {
//         console.log("⏸️ Market conditions unfavorable. Holding cash.");
//     }
    
//     console.log("💤 Agent entering sleep mode...");
// }

// runFossAgent();





import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const OLLAMA_ENDPOINT = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3.2";
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
const CHECK_INTERVAL_MS = 60000; // Check every 60 seconds

const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // SwapRouter02
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
const POOL_FEE = 3000;

// --- ABIS ---
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

// --- UTILS ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 🌐 DATA FETCHING ---
async function fetchRealMarketData(): Promise<string> {
    try {
        const response = await fetch(COINGECKO_API);
        if (!response.ok) throw new Error("API rate limit or failure");
        const data = await response.json();
        
        const ethPrice = data.ethereum.usd;
        const ethChange = data.ethereum.usd_24h_change;

        let narrative = `Ethereum Price: $${ethPrice}. `;
        if (ethChange > 0) {
            narrative += `Market UP ${ethChange.toFixed(2)}% (24h). Bullish momentum.`;
        } else {
            narrative += `Market DOWN ${ethChange.toFixed(2)}% (24h). Bearish pressure.`;
        }
        return narrative;
    } catch (error) {
        console.error("❌ API Error (using backup data):", error);
        return "Ethereum Price: $3000. Market stable.";
    }
}

// --- 🧠 AI BRAIN ---
async function getFossAIDecision(marketData: string): Promise<boolean> {
    // We only log the prompt briefly to keep logs clean
    console.log(`   🧠 Analyzing: "${marketData}"`);

    const prompt = `
    Role: Aggressive DeFi Trader.
    Report: "${marketData}"
    Task: If market is UP or BULLISH -> Output "YES". If DOWN/STABLE -> Output "NO".
    Response (Only YES or NO):
    `;

    try {
        const response = await fetch(OLLAMA_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: MODEL_NAME, prompt: prompt, stream: false })
        });
        const json = await response.json();
        if (json.error || !json.response) return false;

        const decision = json.response.trim().toUpperCase();
        console.log(`   💡 Verdict: [${decision}]`);

        if (decision.includes("YES")) return true;
    } catch (error) {
        console.error("   ❌ Brain Freeze (AI Error):", error);
    }
    return false;
}

// --- 🛠️ EXECUTION ARM ---
// Replace the existing executeTrade function with this one:

async function executeTrade(client: any, wallet: any) {
    const amountToSwap = parseEther("0.0001"); // Swapping tiny amount to test
    console.log("   ⚡ Triggering Swap...");

    try {
        // --- STEP 1: WRAP ETH -> WETH ---
        // We must send ETH 'value' along with this transaction so the Agent has funds to wrap.
        console.log("      1. Wrapping ETH...");
        const wrapData = encodeFunctionData({ abi: WETH_ABI, functionName: 'deposit' });
        
        const wrapHash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [WETH_ADDRESS, amountToSwap, wrapData, 0], 
            value: amountToSwap, // <--- CRITICAL FIX: Sending ETH with the tx
            chain: sepolia,
            account: wallet.account
        });
        await client.waitForTransactionReceipt({ hash: wrapHash }); // Wait for it to finish
        console.log("         ✅ Wrapped.");

        // --- STEP 2: APPROVE ROUTER ---
        // Authorize Uniswap to spend our WETH
        console.log("      2. Approving Uniswap...");
        const approveData = encodeFunctionData({ abi: WETH_ABI, functionName: 'approve', args: [ROUTER_ADDRESS, amountToSwap] });
        
        const approveHash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [WETH_ADDRESS, 0n, approveData, 0],
            chain: sepolia,
            account: wallet.account
        });
        await client.waitForTransactionReceipt({ hash: approveHash }); // Wait for it to finish
        console.log("         ✅ Approved.");

        // --- STEP 3: EXECUTE SWAP ---
        console.log("      3. Swapping WETH -> UNI...");
        const swapData = encodeFunctionData({
            abi: ROUTER_ABI, 
            functionName: 'exactInputSingle',
            args: [{
                tokenIn: WETH_ADDRESS,
                tokenOut: UNI_ADDRESS,
                fee: POOL_FEE,
                recipient: AGENT_ADDRESS,
                amountIn: amountToSwap,
                amountOutMinimum: 0n,
                sqrtPriceLimitX96: 0n
            }]
        });

        const swapHash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [ROUTER_ADDRESS, 0n, swapData, 0],
            chain: sepolia,
            account: wallet.account
        });

        console.log(`   🚀 SWAP SUCCESS: https://sepolia.etherscan.io/tx/${swapHash}`);
        
        // Final wait
        await client.waitForTransactionReceipt({ hash: swapHash });

    } catch (e) {
        console.error("   ❌ Trade Failed:", e);
    }
}

// Place this ABOVE the startDaemon function

async function checkWalletHealth(client: any, address: `0x${string}`): Promise<boolean> {
    const balance = await client.getBalance({ address });
    const balanceEth = formatEther(balance);
    
    console.log(`   💰 Wallet Balance: ${parseFloat(balanceEth).toFixed(4)} ETH`);

    // STOP if balance is below 0.05 ETH (Save money for gas)
    if (parseFloat(balanceEth) < 0.01) {
        console.log("   ⚠️ LOW FUEL WARNING: Balance too low to trade safely.");
        return false;
    }
    return true;
}

// --- 🤖 DAEMON LOOP ---
async function startDaemon() {
    console.log("🐧 Foss Agent: DAEMON MODE STARTED");
    console.log("---------------------------------------");
    
    if (!process.env.OPERATOR_PRIVATE_KEY) {
        console.error("❌ Key missing.");
        process.exit(1);
    }

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    let cycleCount = 1;

    while (true) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`\n⏰ Cycle #${cycleCount} [${timestamp}]`);

        // 1. HEALTH CHECK (The new step)
        const isHealthy = await checkWalletHealth(client, AGENT_ADDRESS);
        if (!isHealthy) {
            console.log("   🛑 Stopping agent to preserve funds.");
            break; // Kills the loop
        }
        // 1. Fetch
        const liveMarketData = await fetchRealMarketData();

        // 2. Decide
        const shouldTrade = await getFossAIDecision(liveMarketData);

        // 3. Act
        if (shouldTrade) {
            await executeTrade(client, wallet);
        } else {
            console.log("   ✋ Holding cash (Market condition unmet).");
        }

        // 4. Sleep
        console.log(`   💤 Sleeping for ${CHECK_INTERVAL_MS / 1000}s...`);
        await sleep(CHECK_INTERVAL_MS);
        cycleCount++;
    }
}

startDaemon();