'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AGENT_ACCOUNT_ABI } from '../constants/abi';
import { MY_AGENT_ADDRESS } from '../constants/addresses';
import { Cpu, ShieldAlert, CheckCircle } from 'lucide-react';
import { encodeFunctionData } from 'viem'; // 👈 IMPORT THIS

// Your Phala Worker (The Brain)
const PHALA_WORKER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 

export default function AgentDelegation() {
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleDelegate = () => {
    // 1. Prepare the Payload: "I want to call setPermissions"
    const permissionData = encodeFunctionData({
      abi: AGENT_ACCOUNT_ABI,
      functionName: 'setPermissions',
      args: [[PHALA_WORKER_ADDRESS], [true]] // Arrays for [Signer] and [Permission]
    });

    // 2. Execute via the Agent: "Agent, please run this payload on yourself"
    writeContract({
      address: MY_AGENT_ADDRESS as `0x${string}`,
      abi: AGENT_ACCOUNT_ABI,
      functionName: 'execute', // 👈 We call EXECUTE, which we know works
      args: [
        MY_AGENT_ADDRESS as `0x${string}`, // Target: The Agent Itself
        BigInt(0),                                // Value: 0 ETH
        permissionData,                    // Data: The permission payload
        0                                  // Operation: 0 (Call)
      ],
    });
  };

  return (
    <div className="w-full max-w-4xl mt-6 p-6 border border-gray-700 rounded-2xl bg-black/40 backdrop-blur-md flex justify-between items-center">
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-900/20 text-purple-400 rounded-lg border border-purple-900/50">
            <Cpu size={28} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white">AI Delegation</h3>
            <p className="text-xs text-gray-400 max-w-sm">
                Authorize the Phala Network TEE to execute trades on your behalf.
            </p>
        </div>
      </div>

      <div>
        {isSuccess ? (
            <div className="flex items-center gap-2 text-green-400 font-bold bg-green-900/20 px-4 py-2 rounded-lg border border-green-900/50">
                <CheckCircle size={20} />
                AI AUTHORIZED
            </div>
        ) : (
            <button 
                onClick={handleDelegate}
                disabled={isPending || isConfirming}
                className={`px-6 py-3 font-bold rounded-lg transition flex items-center gap-2 ${
                    isPending || isConfirming
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                }`}
            >
                {isPending ? "Delegating..." : "Authorize AI Brain"}
                {!isPending && <ShieldAlert size={18} />}
            </button>
        )}
      </div>

    </div>
  );
}