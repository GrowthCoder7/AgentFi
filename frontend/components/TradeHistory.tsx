'use client';

import { useEffect, useState } from 'react';
import { MY_AGENT_ADDRESS } from '../constants/addresses';
import { ExternalLink, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  isError: string;
}

export default function TradeHistory() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch from Etherscan (Sepolia)
  const fetchHistory = async () => {
    if (!MY_AGENT_ADDRESS) return;
    setLoading(true);
    try {
      // Using public Sepolia API (No key needed for low rate, or add &apikey=YOUR_KEY)
      const res = await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${MY_AGENT_ADDRESS}&startblock=0&endblock=99999999&sort=desc`
      );
      const data = await res.json();
      if (data.result && Array.isArray(data.result)) {
        setHistory(data.result.slice(0, 5)); // Show last 5 trades
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    // Auto-refresh every 15s to catch new AI trades
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mt-6 p-6 border border-gray-700 rounded-2xl bg-black/40 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Strategy Execution Log</h3>
        <button 
            onClick={fetchHistory} 
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition"
        >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900 text-gray-200 uppercase font-mono text-xs">
                <tr>
                    <th className="p-4">Time</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Hash</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {history.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                            No trades executed yet...
                        </td>
                    </tr>
                ) : (
                    history.map((tx) => (
                        <tr key={tx.hash} className="hover:bg-gray-900/50 transition">
                            <td className="p-4">
                                {new Date(parseInt(tx.timeStamp) * 1000).toLocaleTimeString()}
                            </td>
                            <td className="p-4">
                                <span className={`flex items-center gap-2 font-bold ${
                                    tx.to.toLowerCase() === MY_AGENT_ADDRESS.toLowerCase() 
                                    ? "text-green-400" 
                                    : "text-blue-400"
                                }`}>
                                    {tx.to.toLowerCase() === MY_AGENT_ADDRESS.toLowerCase() ? (
                                        <><ArrowDownLeft size={16} /> DEPOSIT</>
                                    ) : (
                                        <><ArrowUpRight size={16} /> EXECUTE</>
                                    )}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-white">
                                {(parseFloat(tx.value) / 1e18).toFixed(5)} ETH
                            </td>
                            <td className="p-4">
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-500 hover:text-blue-400 flex items-center gap-1"
                                >
                                    {tx.hash.substring(0, 6)}...{tx.hash.substring(62)}
                                    <ExternalLink size={12} />
                                </a>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-center">
        <a 
            href={`https://sepolia.etherscan.io/address/${MY_AGENT_ADDRESS}`}
            target="_blank"
            rel="noreferrer" 
            className="text-xs text-gray-500 hover:text-white transition"
        >
            View Full Ledger on Etherscan ↗
        </a>
      </div>
    </div>
  );
}