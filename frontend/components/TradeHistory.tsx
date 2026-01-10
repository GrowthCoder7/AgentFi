'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, TrendingUp, Activity } from 'lucide-react';

export default function TradeHistory() {
  const [history, setHistory] = useState<any>(null);

  // Poll the JSON file every 2 seconds to see updates live
  useEffect(() => {
    const fetchData = () => {
        fetch('/agent_history.json')
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.log("Waiting for Agent Data..."));
    };
    
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!history) return <div className="text-gray-500 animate-pulse">Waiting for AI activity...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* 1. Performance Graph */}
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-400" size={20} />
          <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                itemStyle={{ color: '#10B981' }}
              />
              <Line type="monotone" dataKey="total_value" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Trade Log & Rationale */}
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col h-[350px]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-white">Live Decision Feed</h3>
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {history.trades.slice().reverse().map((trade: any) => (
            <div key={trade.id} className="p-3 bg-black/40 rounded-lg border border-gray-800 hover:border-blue-500/50 transition">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.action === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {trade.action} {trade.coin}
                </span>
                <span className="text-xs text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Price: ${trade.price}</span>
                <span>Sentiment: {(trade.sentiment_score * 100).toFixed(0)}%</span>
              </div>
              
              {/* The "Rationale" Section */}
              <div className="flex gap-2 items-start mt-2 pt-2 border-t border-gray-800">
                <FileText size={14} className="text-gray-500 mt-0.5" />
                <p className="text-xs text-gray-400 italic">"{trade.rationale}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}