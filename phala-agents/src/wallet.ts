import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { keccak256, toHex, stringToBytes } from 'viem';

/**
 * GENERATES THE "GHOST" IDENTITY
 * * In production (Phala TEE):
 * The 'ROOT_SECRET' is injected securely into the enclave's environment variables.
 * We hash this secret with a salt to create the Ethereum Private Key.
 * * Result: The key exists ONLY in memory. It is never written to disk.
 */
export function getAgentAccount() {
  // In a real TEE, this comes from process.env.ROOT_SECRET
  // For local testing, use a random string in .env
  const rootSecret = process.env.TEE_ROOT_SECRET || "mock-secret-do-not-use-in-prod";
  
  // Deterministic derivation: Hash(Secret + App_ID)
  // This ensures the same TEE running this code always gets the same wallet.
  const derivedPrivKey = keccak256(
    stringToBytes(`AgentFi_v1_${rootSecret}`)
  );

  const account = privateKeyToAccount(derivedPrivKey);

  console.log(`👻 Agent Active: ${account.address}`);
  return account;
}