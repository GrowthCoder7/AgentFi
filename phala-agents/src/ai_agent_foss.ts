// import { Ollama } from 'ollama';
// import Parser from 'rss-parser';
// import { createWalletClient, http, parseEther, publicActions } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { sepolia } from 'viem/chains';
// import 'dotenv/config';

// // --- CONFIGURATION ---
// const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://agent_brain:11434';
// const ollamaClient = new Ollama({ host: OLLAMA_HOST });
// const parser = new Parser();

// // WALLET SETUP (Base Sepolia Testnet)
// // Note: In production, never hardcode the fallback key. This is a known testnet private key.
// const PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || "0xd8e318557920a9fef30877e240b41254e21e18c42b1a99391baaf7ecec5cd2f4"; 
// const ACCOUNT = privateKeyToAccount(PRIVATE_KEY as `0x${string}`); 

// const client = createWalletClient({
//   account: ACCOUNT,
//   chain: sepolia,
//   transport: http()
// }).extend(publicActions); // Adds ability to read data too

// // --- 1. THE EYES (Data Fetching) ---

// async function fetchMarketStats() {
//     try {
//         console.log("   🔍 Fetching price history for RSI calculation...");
//         // Mocking Data for Stability. In production, replace with CoinGecko API.
//         const prices = [
//             3000, 3050, 3100, 3080, 3060, 3040, 3020, 
//             3010, 3005, 3000, 2990, 2980, 2950, 2900 
//         ]; 
//         const currentPrice = 3095.36; 
        
//         // Simple RSI Calculation Logic
//         const gains = [];
//         const losses = [];
//         for (let i = 1; i < prices.length; i++) {
//             const difference = prices[i] - prices[i - 1];
//             if (difference >= 0) gains.push(difference);
//             else losses.push(Math.abs(difference));
//         }
        
//         const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
//         const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
//         const rs = avgGain / avgLoss;
//         const rsi = 100 - (100 / (1 + rs));

//         return { price: currentPrice, rsi: rsi };
//     } catch (error) {
//         console.error("   ❌ Error fetching market data:", error);
//         return null;
//     }
// }

// async function fetchNews() {
//     try {
//         console.log("   📰 Reading the news...");
//         const feed = await parser.parseURL('https://cointelegraph.com/rss');
//         // Take top 3 headlines
//         const headlines = feed.items.slice(0, 3).map(item => item.title).join(". ");
//         console.log(`      "${headlines.substring(0, 60)}..."`);
//         return headlines;
//     } catch (error) {
//         console.error("   ❌ Error fetching news:", error);
//         return "No news available.";
//     }
// }

// // --- 2. THE HANDS (Execution) ---

// async function executeTrade() {
//     console.log("   🔴 TRADING SIGNAL DETECTED! EXECUTING ON-CHAIN...");
//     try {
//         // Send 0.0001 ETH to self as a "Buy" signal test
//         const hash = await client.sendTransaction({
//             to: ACCOUNT.address, 
//             value: parseEther('0.0001') 
//         });
//         console.log(`   🚀 Transaction Sent! Hash: https://sepolia.basescan.org/tx/${hash}`);
//         return hash;
//     } catch (error) {
//         console.error("   ❌ Trade Failed:", error);
//         return null;
//     }
// }

// // --- 3. THE BRAIN (Daemon Loop) ---

// async function startDaemon() {
//     console.log("\n🐧 Foss Agent: QUANT MODE ENGAGED");
//     console.log("---------------------------------------");

//     while (true) {
//         console.log("\n⏰ Cycle Active...");

//         // Check Wallet Balance
//         const balance = await client.getBalance({ address: ACCOUNT.address });
//         const ethBalance = Number(balance) / 1e18;
//         console.log(`   💰 Wallet Balance: ${ethBalance.toFixed(4)} ETH`);

//         // Get Data
//         const market = await fetchMarketStats();
//         const news = await fetchNews();
        
//         if (!market) {
//             console.log("   ⚠️ Missing market data, skipping cycle.");
//             await new Promise(resolve => setTimeout(resolve, 10000));
//             continue;
//         }

//         console.log(`   📊 Market Status: Price $${market.price.toFixed(2)} | RSI: ${market.rsi.toFixed(2)}`);

//         // Construct Prompt
//         const prompt = `
//     You are a Senior DeFi Risk Manager and Algorithmic Trader.
//     Your goal is capital preservation first, and profit generation second.

//     ### MARKET SNAPSHOT
//     - Asset: Ethereum (ETH)
//     - Current Price: $${market.price.toFixed(2)} USD
//     - RSI (14-period): ${market.rsi.toFixed(2)} 
//     - News Sentiment Context: "${news}"

//     ### TRADING STRATEGY & RULES
//     1. **Technicals (RSI):** - RSI < 30: Potential Oversold (Buy Zone), BUT watch for falling knife momentum.
//        - RSI > 70: Potential Overbought (Sell/Wait Zone).
//        - RSI 30-70: Neutral/Trend Continuation.
    
//     2. **Fundamentals (News):**
//        - Negative News + Low RSI = "Falling Knife" (High Risk: DO NOT BUY).
//        - Positive News + Low RSI = "Golden Dip" (High Conviction BUY).
//        - Neutral News + Low RSI = "Technical Bounce" (Moderate Buy).

//     3. **Risk Guardrails:**
//        - NEVER recommend a buy if the news implies a systemic failure, hack, or regulatory crackdown, regardless of RSI.

//     ### TASK
//     Analyze the data and produce a JSON response. 
//     1. Analyze the RSI context.
//     2. Analyze the news sentiment.
//     3. Determine a decision: "BUY", "SELL", or "HOLD".
//     4. Assign a confidence score (0-100).

//     ### OUTPUT FORMAT (Strict JSON Only, no markdown):
//     {
//       "thought_process": "Brief explanation of your analysis...",
//       "risk_factor": "LOW", "MEDIUM", or "HIGH",
//       "decision": "BUY", "SELL", or "HOLD",
//       "confidence": 85
//     }
// `;

//         console.log("   🧠 Consulting Quant Model...");
        
//         try {
//             const response = await ollamaClient.chat({
//                 model: 'llama3.2', // Ensure this matches your docker-compose model
//                 messages: [{ role: 'user', content: prompt }],
//             });

//             const rawDecision = response.message.content.trim();
//             // Clean the output to get just the word
//             const decision = rawDecision.toUpperCase().replace(/[^A-Z]/g, '');

//             console.log(`   💡 Verdict: [${decision}]`);

//             if (decision.includes("YES")) {
//                 await executeTrade();
//             } else {
//                 console.log("   ⏳ Holding position.");
//             }

//         } catch (error) {
//             console.error("   ❌ LLM Error:", error);
//         }

//         // Wait 30 seconds before next cycle
//         await new Promise(resolve => setTimeout(resolve, 30000));
//     }
// }

// startDaemon();


// import { Ollama } from 'ollama';
// import Parser from 'rss-parser';
// import { createWalletClient, http, parseEther, publicActions } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { sepolia } from 'viem/chains';
// import 'dotenv/config';

// // --- CONFIGURATION ---
// const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://agent_brain:11434';
// const ollamaClient = new Ollama({ host: OLLAMA_HOST });
// const parser = new Parser();

// // WALLET SETUP (Base Sepolia Testnet)
// const PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || "0xd8e318557920a9fef30877e240b41254e21e18c42b1a99391baaf7ecec5cd2f4"; 
// const ACCOUNT = privateKeyToAccount(PRIVATE_KEY as `0x${string}`); 

// const client = createWalletClient({
//   account: ACCOUNT,
//   chain: sepolia,
//   transport: http()
// }).extend(publicActions);

// // --- HELPER: Clean LLM Output ---
// function cleanJson(text: string): string {
//     // Remove markdown code blocks if present (e.g. ```json ... ```)
//     return text.replace(/```json|```/g, '').trim();
// }

// // --- 1. THE EYES (Data Fetching) ---

// async function fetchMarketStats() {
//     try {
//         console.log("   🔍 Fetching price history for RSI calculation...");
//         // Mocking Data. In production, replace with real API.
//         const prices = [
//             3000, 3050, 3100, 3080, 3060, 3040, 3020, 
//             3010, 3005, 3000, 2990, 2980, 2950, 2900 
//         ]; 
//         const currentPrice = 3095.36; 
        
//         // Simple RSI Calculation
//         const gains = [];
//         const losses = [];
//         for (let i = 1; i < prices.length; i++) {
//             const difference = prices[i] - prices[i - 1];
//             if (difference >= 0) gains.push(difference);
//             else losses.push(Math.abs(difference));
//         }
        
//         const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
//         const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
//         const rs = avgGain / avgLoss;
//         const rsi = 100 - (100 / (1 + rs));

//         return { price: currentPrice, rsi: rsi };
//     } catch (error) {
//         console.error("   ❌ Error fetching market data:", error);
//         return null;
//     }
// }

// async function fetchNews() {
//     try {
//         console.log("   📰 Reading the news...");
//         const feed = await parser.parseURL('https://cointelegraph.com/rss');
//         const headlines = feed.items.slice(0, 3).map(item => item.title).join(". ");
//         console.log(`      "${headlines.substring(0, 60)}..."`);
//         return headlines;
//     } catch (error) {
//         console.error("   ❌ Error fetching news:", error);
//         return "No news available.";
//     }
// }

// // --- 2. THE HANDS (Execution) ---

// async function executeTrade() {
//     console.log("   🔴 TRADING SIGNAL DETECTED! EXECUTING ON-CHAIN...");
//     try {
//         const hash = await client.sendTransaction({
//             to: ACCOUNT.address, 
//             value: parseEther('0.0001') 
//         });
//         console.log(`   🚀 Transaction Sent! Hash: https://sepolia.basescan.org/tx/${hash}`);
//         return hash;
//     } catch (error) {
//         console.error("   ❌ Trade Failed:", error);
//         return null;
//     }
// }

// // --- 3. THE BRAIN (Daemon Loop) ---

// async function startDaemon() {
//     console.log("\n🐧 Foss Agent: RISK MANAGER MODE ENGAGED");
//     console.log("---------------------------------------");
    
//     // 

//     while (true) {
//         console.log("\n⏰ Cycle Active...");

//         // Check Wallet
//         const balance = await client.getBalance({ address: ACCOUNT.address });
//         const ethBalance = Number(balance) / 1e18;
//         console.log(`   💰 Wallet Balance: ${ethBalance.toFixed(4)} ETH`);

//         // Get Data
//         const market = await fetchMarketStats();
//         const news = await fetchNews();
        
//         if (!market) {
//             console.log("   ⚠️ Missing market data, skipping cycle.");
//             await new Promise(resolve => setTimeout(resolve, 10000));
//             continue;
//         }

//         console.log(`   📊 Market Status: Price $${market.price.toFixed(2)} | RSI: ${market.rsi.toFixed(2)}`);

//         // --- NEW PROMPT: JSON OUTPUT ---
//         const prompt = `
//     You are a Senior DeFi Risk Manager and Algorithmic Trader.
//     Your goal is capital preservation first, and profit generation second.

//     ### MARKET SNAPSHOT
//     - Asset: Ethereum (ETH)
//     - Current Price: $${market.price.toFixed(2)} USD
//     - RSI (14-period): ${market.rsi.toFixed(2)} 
//     - News Sentiment Context: "${news}"

//     ### TRADING STRATEGY & RULES
//     1. **Technicals (RSI):** - RSI < 30: Potential Oversold (Buy Zone), BUT watch for falling knife.
//        - RSI > 70: Potential Overbought (Sell/Wait Zone).
    
//     2. **Fundamentals (News):**
//        - Negative News + Low RSI = "Falling Knife" (High Risk: DO NOT BUY).
//        - Positive News + Low RSI = "Golden Dip" (High Conviction BUY).
//        - Neutral News + Low RSI = "Technical Bounce" (Moderate Buy).

//     3. **Risk Guardrails:**
//        - NEVER recommend a buy if the news implies a systemic failure, hack, or regulatory crackdown.

//     ### TASK
//     Analyze the data and produce a JSON response. 
//     1. Analyze the RSI context.
//     2. Analyze the news sentiment.
//     3. Determine a decision: "BUY", "SELL", or "HOLD".
//     4. Assign a confidence score (0-100).

//     ### OUTPUT FORMAT (Strict JSON Only, no markdown):
//     {
//       "thought_process": "Brief explanation of your analysis...",
//       "risk_factor": "LOW", "MEDIUM", or "HIGH",
//       "decision": "BUY", "SELL", or "HOLD",
//       "confidence": 85
//     }
// `;

//         console.log("   🧠 Consulting Quant Model...");
        
//         try {
//             const response = await ollamaClient.chat({
//                 model: 'llama3.2', 
//                 messages: [{ role: 'user', content: prompt }],
//             });

//             const rawContent = response.message.content;
//             const cleanedContent = cleanJson(rawContent); // Remove markdown formatting

//             // Parse JSON
//             const data = JSON.parse(cleanedContent);

//             console.log(`   🤖 Logic: ${data.thought_process}`);
//             console.log(`   ⚠️ Risk: ${data.risk_factor}`);
//             console.log(`   🎯 Confidence: ${data.confidence}%`);
//             console.log(`   💡 Verdict: [${data.decision}]`);

//             // --- EXECUTION LOGIC ---
//             // We now have 3 checks: 
//             // 1. Decision is BUY
//             // 2. Confidence is High (>70)
//             // 3. Risk is NOT High
//             if (data.decision === "BUY" && data.confidence > 70 && data.risk_factor !== "HIGH") {
//                 await executeTrade();
//             } else {
//                 console.log("   ⏳ Holding position (Criteria not met).");
//             }

//         } catch (error) {
//             console.error("   ❌ LLM/JSON Error:", error);
//             // Optional: Print raw response to debug if JSON fails
//             // console.log("Raw Response:", response.message.content);
//         }

//         // Wait 30 seconds
//         await new Promise(resolve => setTimeout(resolve, 30000));
//     }
// }

// startDaemon();


import { Ollama } from 'ollama';
import Parser from 'rss-parser';
import { createWalletClient, http, parseEther, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import 'dotenv/config';

// --- CONFIGURATION ---
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'; // Default to localhost for non-docker
const ollamaClient = new Ollama({ host: OLLAMA_HOST });
const parser = new Parser();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

// WALLET SETUP (Base Sepolia Testnet)
const PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || "0xd8e318557920a9fef30877e240b41254e21e18c42b1a99391baaf7ecec5cd2f4"; 
const ACCOUNT = privateKeyToAccount(PRIVATE_KEY as `0x${string}`); 

const client = createWalletClient({
  account: ACCOUNT,
  chain: sepolia,
  transport: http()
}).extend(publicActions);

// --- HELPER: Notifications (The Voice) ---
async function broadcast(message: string) {
    if (!DISCORD_WEBHOOK_URL) return; // Silent mode if no URL
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
        });
    } catch (e) {
        console.error("   ❌ Failed to send notification", e);
    }
}

// --- HELPER: Clean LLM Output ---
// --- HELPER: Clean LLM Output ---
function cleanJson(text: string): string {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json|```/g, '').trim();
    
    // 2. Find the first '{' and the last '}' to extract JUST the JSON object
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1) {
        return cleaned.substring(firstOpen, lastClose + 1);
    }
    
    // Fallback: return original if no brackets found (will fail safely in try/catch)
    return cleaned;
}

// --- 1. THE EYES (Data Fetching) ---
async function fetchMarketStats() {
    try {
        console.log("   🔍 Fetching price history for RSI calculation...");
        // Mocking Data. In production, replace with CoinGecko/Binance API.
        const prices = [
            3000, 3050, 3100, 3080, 3060, 3040, 3020, 
            3010, 3005, 3000, 2990, 2980, 2950, 2900 
        ]; 
        const currentPrice = 3095.36; 
        
        // RSI Calculation
        const gains = [];
        const losses = [];
        for (let i = 1; i < prices.length; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) gains.push(difference);
            else losses.push(Math.abs(difference));
        }
        
        const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return { price: currentPrice, rsi: rsi };
    } catch (error) {
        console.error("   ❌ Error fetching market data:", error);
        return null;
    }
}

async function fetchNews() {
    try {
        console.log("   📰 Reading the news...");
        const feed = await parser.parseURL('https://cointelegraph.com/rss');
        const headlines = feed.items.slice(0, 3).map(item => item.title).join(". ");
        return headlines;
    } catch (error) {
        console.error("   ❌ Error fetching news:", error);
        return "No news available.";
    }
}

// --- 2. THE HANDS (Execution) ---
async function executeTrade() {
    console.log("   🔴 TRADING SIGNAL DETECTED! EXECUTING ON-CHAIN...");
    
    // Alert Discord: Intent to Trade
    await broadcast(`🚨 **TRADE SIGNAL DETECTED**\nPreparing to BUY ETH...`);

    try {
        const hash = await client.sendTransaction({
            to: ACCOUNT.address, 
            value: parseEther('0.0001') 
        });
        console.log(`   🚀 Transaction Sent! Hash: ${hash}`);
        
        // Alert Discord: Success
        await broadcast(`✅ **ORDER EXECUTED**\nTx Hash: [View on Explorer](https://sepolia.basescan.org/tx/${hash})`);
        
        return hash;
    } catch (error) {
        console.error("   ❌ Trade Failed:", error);
        await broadcast(`⚠️ **TRADE FAILED**\nError: ${error}`);
        return null;
    }
}

// --- 3. THE BRAIN (Daemon Loop) ---
async function startDaemon() {
    console.log("\n🐧 Foss Agent: PROD MODE ENGAGED");
    console.log("---------------------------------------");
    await broadcast("🤖 **Agent Online**: Monitoring ETH Markets...");

    while (true) {
        console.log("\n⏰ Cycle Active...");

        const market = await fetchMarketStats();
        const news = await fetchNews();
        
        if (!market) {
            console.log("   ⚠️ Missing data, skipping.");
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
        }

        const prompt = `
    You are a Senior DeFi Risk Manager.

    ### MARKET SNAPSHOT
    - Asset: Ethereum (ETH)
    - Current Price: $${market.price.toFixed(2)} USD
    - RSI (14-period): ${market.rsi.toFixed(2)} 
    - News Sentiment Context: "${news}"

    ### TRADING RULES
    1. **Technicals:** RSI < 30 is BUY zone, RSI > 70 is SELL.
    2. **Fundamentals:** - Negative News + Low RSI = "Falling Knife" (DO NOT BUY).
       - Positive News + Low RSI = "Golden Dip" (BUY).
    3. **Guardrails:** NEVER buy on hack/regulatory news.

    ### OUTPUT FORMAT (Strict JSON Only):
    {
      "thought_process": "Brief analysis...",
      "risk_factor": "LOW", "MEDIUM", or "HIGH",
      "decision": "BUY", "SELL", or "HOLD",
      "confidence": 0-100
    }
`;

        try {
            const response = await ollamaClient.chat({
                model: 'llama3.2', 
                messages: [{ role: 'user', content: prompt }],
            });

            const data = JSON.parse(cleanJson(response.message.content));

            console.log(`   🤖 Logic: ${data.thought_process}`);
            console.log(`   💡 Verdict: [${data.decision}] (Conf: ${data.confidence}%)`);

            if (data.decision === "BUY" && data.confidence > 70 && data.risk_factor !== "HIGH") {
                await executeTrade();
            } else if (data.risk_factor === "HIGH") {
                console.log("   ⚠️ High Risk detected. Holding.");
            } else {
                console.log("   ⏳ Conditions not met. Holding.");
            }

        } catch (error) {
            console.error("   ❌ Cycle Error:", error);
        }

        // Heartbeat every 60 seconds
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}

startDaemon();