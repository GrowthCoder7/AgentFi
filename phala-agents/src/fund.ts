import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

async function fundAgent() {
    console.log("⛽ Starting Agent Refuel Protocol...");

    const account = privateKeyToAccount(process.env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    const AGENT_ADDRESS = process.env.AGENT_ADDRESS as `0x${string}`;
    
    // 1. Check Agent Balance
    const balance = await client.getBalance({ address: AGENT_ADDRESS });
    console.log(`🏦 Agent Balance: ${formatEther(balance)} ETH`);

    if (balance < parseEther("0.01")) {
        console.log("⚠️  Balance is low. Sending funds to Agent...");
        
        // 2. Send ETH to Agent
        const txHash = await wallet.sendTransaction({
            to: AGENT_ADDRESS,
            value: parseEther("0.01") // Sending 0.01 ETH
        });

        console.log(`🚀 Funds Sent! Hash: ${txHash}`);
        console.log("⏳ Waiting for confirmation...");
        
        await client.waitForTransactionReceipt({ hash: txHash });
        console.log("✅ Agent Funded successfully!");
    } else {
        console.log("✅ Agent already has sufficient funds.");
    }
}

fundAgent();