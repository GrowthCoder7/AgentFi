'use client';

import { useEffect, useState } from 'react'; // <--- Added useState & useEffect
import { useBalance, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AGENT_FACTORY_ADDRESS } from '../constants/addresses'; 
import { AGENT_FACTORY_ABI } from '../constants/abi';
import { Loader2, PlusCircle, ShieldCheck } from 'lucide-react';

export default function AgentDashboard() {
  // 1. Fix Hydration Error: Add a mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { address } = useAccount();

  // Hook to Write (Mint Agent)
  const { data: hash, isPending, writeContract } = useWriteContract();

  // Hook to Wait for Transaction Confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // User Balance Hook
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address, 
  });

  const handleCreateAgent = async () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }
    
    console.log("Minting Agent on Sepolia...");
    // Inside handleCreateAgent function
writeContract({
      address: AGENT_FACTORY_ADDRESS as `0x${string}`,
      abi: AGENT_FACTORY_ABI,
      functionName: 'createAgent',
      args: [], 
      gas: BigInt(600000), // <--- ADD THIS LINE (Forces a high gas limit)
    });
  };

  // 2. Prevent rendering dynamic data until mounted on client
  if (!mounted) {
    return (
        <div className="w-full max-w-4xl mt-10 p-8 border border-gray-700 rounded-2xl bg-black/50 backdrop-blur-md flex justify-center">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mt-10 p-8 border border-gray-700 rounded-2xl bg-black/50 backdrop-blur-md relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white">🛡️ Agent Command</h2>
            {isSuccess && (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-mono text-green-400 border border-green-900 bg-green-900/20 rounded-full animate-pulse">
                    <ShieldCheck size={14} /> AGENT MINTED
                </span>
            )}
        </div>
        <div className="text-right">
            <p className="text-xs text-gray-500">Network</p>
            <p className="text-sm font-mono text-blue-400">Sepolia Testnet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: User Status */}
        <div className="p-6 bg-gray-900/80 rounded-xl border border-gray-800 hover:border-blue-500/30 transition">
          <p className="text-gray-400 text-sm mb-2">Your Deployer Balance</p>
          <div className="text-4xl font-mono text-white font-bold">
            {/* Safe to render dynamic data now because we checked 'mounted' */}
            {isBalanceLoading ? "..." : balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : "0.00 ETH"}
          </div>
          <p className="text-xs text-gray-500 mt-2 truncate">
            Wallet: {address || "Not Connected"}
          </p>
        </div>

        {/* Card 2: Action Center */}
        <div className="p-6 bg-gray-900/80 rounded-xl border border-gray-800 flex flex-col justify-center items-center text-center">
            {!isSuccess ? (
                <>
                    <p className="text-gray-300 text-sm mb-4">No Active Agent Found. Initialize Protocol?</p>
                    <button 
                        onClick={handleCreateAgent}
                        disabled={isPending || isConfirming}
                        className={`px-6 py-3 font-bold rounded-lg transition flex items-center gap-2 ${
                            isPending || isConfirming 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                        }`}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                {isPending ? "Confirm in Wallet..." : "Deploying Agent..."}
                            </>
                        ) : (
                            <>
                                <PlusCircle size={20} />
                                Initialize Agent
                            </>
                        )}
                    </button>
                    {hash && <p className="text-xs text-gray-500 mt-3 break-all">Tx: {hash}</p>}
                </>
            ) : (
                <div className="text-green-400">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Deployment Complete</h3>
                    <p className="text-xs text-gray-500 mt-1">Your Agent is now live on Sepolia.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}