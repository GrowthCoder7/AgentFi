'use client';

import { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow'; 
import 'reactflow/dist/style.css'; // Mandatory CSS

// If using Next.js 13/14 App Router, we might need a wrapper to fix hydration issues,
// but let's try direct import first.

export default function DecisionGraph() {
  const [tradeData, setTradeData] = useState<any>(null);

  useEffect(() => {
    // Poll for updates
    const interval = setInterval(() => {
        fetch('/agent_history.json')
        .then(res => res.json())
        .then(data => {
            if (data.trades.length > 0) {
                // Get the LATEST trade
                setTradeData(data.trades[data.trades.length - 1]);
            }
        });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!tradeData) return <div className="text-gray-500 text-sm">Waiting for Agent Decision...</div>;

  return (
    <div className="w-full h-[500px] bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🧠 Live Neural Decision Path
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
                    {tradeData.action} {tradeData.coin}
                </span>
            </h3>
            <span className="text-xs text-gray-400">
                {new Date(tradeData.timestamp).toLocaleTimeString()}
            </span>
        </div>

        {/* The Graph Container */}
        <div className="w-full h-[400px] border border-gray-700 rounded-lg overflow-hidden bg-black/40">
            <ReactFlow 
                nodes={tradeData.graph.nodes}
                edges={tradeData.graph.edges}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#374151" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    </div>
  );
}