// src/config.ts
import { defineChain } from 'viem';

// 1. The Doorway
export const SEPOLIA_RPC = "https://rpc.ankr.com/eth_sepolia"; 

// 2. The Factory (Singleton)
export const ERC6551_REGISTRY = "0x000000006551c19487814612e58FE06813775758";

// 3. The Blueprint (Logic)
export const ERC6551_IMPLEMENTATION = "0x41C8f39463A868d3A88af00cd0cf5d05Db7C2d03";

// 4. The Identity (NFT Collection)
export const TARGET_NFT_CONTRACT = "0x...";