// frontend/constants/abi.ts

// 1. The Factory (Used to Mint)
export const AGENT_FACTORY_ABI = [
  {
    "type": "function",
    "name": "createAgent",
    "inputs": [], // <--- CHANGE THIS: It must be empty!
    "outputs": [{ "name": "agentAddress", "type": "address", "internalType": "address" }],
    "stateMutability": "nonpayable"
  }
] as const;

// 2. The Agent Wallet (Used to Fund & Delegate)
export const AGENT_ACCOUNT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" },
      { "internalType": "uint8", "name": "operation", "type": "uint8" }
    ],
    "name": "execute",
    "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
        { "internalType": "address", "name": "signer", "type": "address" }, 
        { "internalType": "bool", "name": "permission", "type": "bool" }
    ],
    "name": "setPermissions", // <--- CRITICAL FOR AI CONTROL
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;