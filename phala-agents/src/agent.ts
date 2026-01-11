// import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { sepolia } from 'viem/chains';
// import dotenv from 'dotenv';

// dotenv.config();

// // CONFIGURATION
// const CHECK_INTERVAL = 10000; // 10 Seconds wait between cycles
// const MIN_ETH_THRESHOLD = 0.005; 
// // 🚨 TRICK: Set target HIGHER than current price ($3093) to force a "BUY" trigger for testing
// const TARGET_ASSET_PRICE = 4000; 

// // ABI for the Agent Account (To call 'execute')
// const AGENT_ABI = [
//   {
//     "inputs": [
//       { "internalType": "address", "name": "to", "type": "address" },
//       { "internalType": "uint256", "name": "value", "type": "uint256" },
//       { "internalType": "bytes", "name": "data", "type": "bytes" },
//       { "internalType": "uint8", "name": "operation", "type": "uint8" }
//     ],
//     "name": "execute",
//     "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }],
//     "stateMutability": "payable",
//     "type": "function"
//   }
// ] as const;

// async function runAgent() {
//     console.log("🧠 Phala Agent 'Brain' Initialized... (Active Trader Mode)");
    
//     // 1. Setup Wallet (The Operator)
//     const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
//     const client = createPublicClient({ chain: sepolia, transport: http() });
//     const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

//     const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;

//     console.log(`🔑 Operator: ${account.address}`);
//     console.log(`🏦 Managing Agent: ${AGENT_ADDRESS}`);

//     // 2. The Recursive Loop (Prevents Overlap)
//     const runCycle = async () => {
//         try {
//             console.log("\n--- ⏱️  New Decision Cycle ---");
            
//             // A. Market Monitor
//             const priceReq = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
//             const priceData = await priceReq.json() as { ethereum: { usd: number } };
//             const ethPrice = priceData.ethereum.usd;
            
//             console.log(`📊 Market Check: ETH is $${ethPrice} (Target: <$${TARGET_ASSET_PRICE})`);

//             // B. Check Balance
//             const balance = await client.getBalance({ address: AGENT_ADDRESS });
//             const formattedBalance = formatEther(balance);
//             console.log(`💰 Agent Treasury: ${formattedBalance} ETH`);

//             if (Number(formattedBalance) < MIN_ETH_THRESHOLD) {
//                 console.log("⚠️  Balance too low to trade.");
//                 // Even if balance is low, we schedule the next check
//                 setTimeout(runCycle, CHECK_INTERVAL);
//                 return;
//             }

//             // C. EXECUTION LOGIC
//             if (ethPrice < TARGET_ASSET_PRICE) {
//                 console.log("💡 OPPORTUNITY DETECTED! Executing Trade...");
                
//                 // execute() call to the Agent Contract
//                 const hash = await wallet.writeContract({
//                     address: AGENT_ADDRESS,
//                     abi: AGENT_ABI,
//                     functionName: 'execute',
//                     args: [
//                         account.address, // To: The Operator (You)
//                         parseEther("0.0001"), // Value: 0.0001 ETH
//                         "0x", // Data: Empty
//                         0 // Operation: Call
//                     ]
//                 });

//                 console.log(`🚀 TRANSACTION SENT! Hash: ${hash}`);
//                 console.log("Waiting for confirmation...");
                
//                 // WAIT for the block before continuing
//                 const receipt = await client.waitForTransactionReceipt({ hash });
//                 console.log(`✅ Trade Confirmed in Block ${receipt.blockNumber}`);
                
//                 // Optional: Longer pause after a trade to avoid draining funds
//                 console.log("Sleeping for 60s after trade...");
//                 await new Promise(r => setTimeout(r, 60000)); 
//             } else {
//                 console.log("🛡️  Price too high. HOLDING.");
//             }

//         } catch (error) {
//             console.error("❌ Error:", error);
//         } finally {
//             // Schedule the NEXT run only after THIS one finishes
//             setTimeout(runCycle, CHECK_INTERVAL);
//         }
//     };

//     // Kickstart the loop
//     runCycle();
// }

// runAgent();


import { createPublicClient, createWalletClient, http, encodeFunctionData, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// 1. Setup the Network and User
const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
const client = createPublicClient({ chain: sepolia, transport: http() });
const wallet = createWalletClient({ account, chain: sepolia, transport: http() });
const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;

// 2. The Agent "Skeleton" ABI (The one we know works)
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

async function runAgentBot() {
    console.log("🤖 Agent Bot Starting...");
    console.log(`Checking control of: ${AGENT_ADDRESS}`);

    // --- EXAMPLE LOGIC: Send 0.0001 ETH to yourself ---
    // In a real scenario, this 'data' would be a Uniswap swap call
    const target = account.address; 
    const amount = parseEther("0.0001"); 

    try {
        console.log("💸 Attempting to execute a trade/transfer...");
        
        const hash = await wallet.writeContract({
            address: AGENT_ADDRESS,
            abi: AGENT_ABI,
            functionName: 'execute',
            args: [
                target,      // To: Yourself
                amount,      // Value: 0.0001 ETH
                "0x",        // Data: Empty (Simple Transfer)
                0            // Operation: Call
            ]
        });

        console.log(`🚀 Trade Executed! Hash: ${hash}`);
        console.log("✅ The Agent is ALIVE and following orders.");

    } catch (error) {
        console.error("❌ Agent Stalled:", error);
    }
}

runAgentBot();