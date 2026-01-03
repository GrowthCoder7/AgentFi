import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { ERC6551_REGISTRY, ERC6551_IMPLEMENTATION, SEPOLIA_RPC } from './config';

const client = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC)
});

const REGISTRY_ABI = parseAbi([
  'function account(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) external view returns (address)'
]);

const NFT_ABI = parseAbi([
  'function ownerOf(uint256 tokenId) external view returns (address)'
]);

export async function getTBA(nftContract: string, tokenId: string) {
  // 1. Compute the computed address of the Token Bound Account (TBA)
  const tbaAddress = await client.readContract({
    address: ERC6551_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'account',
    args: [
        ERC6551_IMPLEMENTATION, 
        "0x0000000000000000000000000000000000000000000000000000000000000000", // salt
        11155111n, // Sepolia Chain ID
        nftContract as `0x${string}`,
        BigInt(tokenId)
    ]
  });

  return tbaAddress;
}

export async function checkAgentStatus(nftContract: string, tokenId: string) {
    const tba = await getTBA(nftContract, tokenId);
    
    // 2. Check Balance of the TBA
    const balance = await client.getBalance({ address: tba });

    // 3. Check who owns the Root NFT (The "User")
    const nftOwner = await client.readContract({
        address: nftContract as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
    });

    return {
        tbaAddress: tba,
        balance: balance.toString(),
        nftOwner: nftOwner
    };
}