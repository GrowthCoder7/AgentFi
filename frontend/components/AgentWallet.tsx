'use client';

import { useState } from 'react';
import { useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { MY_AGENT_ADDRESS } from '../constants/addresses';
import { Wallet, ArrowRightLeft, TrendingUp } from 'lucide-react';

export default function AgentWallet() {
  const [amount, setAmount] = useState('0.01');

  // 1. Get Agent's Balance
  const { data: balance, refetch } = useBalance({
    address: MY_AGENT_ADDRESS as `0x${string}`,
  });

  // 2. Hook to Send ETH (Funding the Agent)
  const { sendTransaction, data: hash, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = () => {
    if (!amount) return;
    sendTransaction({
      to: MY_AGENT_ADDRESS as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div className="w-full max-w-4xl mt-6 p-6 border border-gray-700 rounded-2xl bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
            <Wallet size={24} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white">Agent Treasury</h3>
            <p className="text-xs text-gray-400 font-mono">{MY_AGENT_ADDRESS}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Current Liquidity</p>
            <div className="text-3xl font-bold text-white mt-2">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : "0.0000 ETH"}
            </div>
            <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                <TrendingUp size={12} />
                <span>Ready to Trade</span>
            </div>
        </div>

        {/* Deposit Actions */}
        <div className="md:col-span-2 bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Fund Your Agent</p>
            <div className="flex gap-4">
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-black border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="0.0 ETH"
                />
                <button 
                    onClick={handleDeposit}
                    disabled={isPending || isConfirming}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending ? "Sending..." : "Deposit ETH"}
                    <ArrowRightLeft size={16} />
                </button>
            </div>
            {isSuccess && (
                <p className="text-green-400 text-xs mt-3">
                    ✅ Deposit Successful! Your Agent is now funded.
                </p>
            )}
        </div>
      </div>
    </div>
  );
}