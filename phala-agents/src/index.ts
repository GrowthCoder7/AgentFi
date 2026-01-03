// src/index.ts
import { getAgentAccount } from './wallet';
import { checkAgentStatus } from './blockchain';
import { TARGET_NFT_CONTRACT } from './config';

async function main() {
    console.log("--- STARTING AGENTFI TEE NODE ---");

    // 1. WAKE UP (Identity)
    const agent = getAgentAccount();

    // 2. TARGET IDENTIFICATION (Configuration)
    const tokenId = "0"; 

    // 3. OBSERVE (The Loop)
    try {
        const status = await checkAgentStatus(TARGET_NFT_CONTRACT, tokenId);

        console.log(`\n--- STATUS REPORT ---`);
        console.log(`🤖 Agent Address:    ${agent.address}`); // The Ghost
        console.log(`🏰 Wallet (TBA):     ${status.tbaAddress}`); // The Shell
        console.log(`👑 Real Owner:       ${status.nftOwner}`); // The Human
        
        // 4. DECISION TREE (Placeholder)
        if (BigInt(status.balance) > 0n) {
             console.log("✅ Funds detected. Ready to execute.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();