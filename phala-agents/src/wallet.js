"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentAccount = getAgentAccount;
var accounts_1 = require("viem/accounts");
var viem_1 = require("viem");
/**
 * GENERATES THE "GHOST" IDENTITY
 * * In production (Phala TEE):
 * The 'ROOT_SECRET' is injected securely into the enclave's environment variables.
 * We hash this secret with a salt to create the Ethereum Private Key.
 * * Result: The key exists ONLY in memory. It is never written to disk.
 */
function getAgentAccount() {
    // In a real TEE, this comes from process.env.ROOT_SECRET
    // For local testing, use a random string in .env
    var rootSecret = process.env.TEE_ROOT_SECRET || "mock-secret-do-not-use-in-prod";
    // Deterministic derivation: Hash(Secret + App_ID)
    // This ensures the same TEE running this code always gets the same wallet.
    var derivedPrivKey = (0, viem_1.keccak256)((0, viem_1.stringToBytes)("AgentFi_v1_".concat(rootSecret)));
    var account = (0, accounts_1.privateKeyToAccount)(derivedPrivKey);
    console.log("\uD83D\uDC7B Agent Active: ".concat(account.address));
    return account;
}
