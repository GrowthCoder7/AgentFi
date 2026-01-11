import { ConnectButton } from '@rainbow-me/rainbowkit';
import AgentDashboard from '../components/AgentDashboard';
import DecisionGraph from '@/components/DecisionGraph';
import AgentWallet from '@/components/AgentWallet';
// import TradeHistory from '@/components/TradeHistory';
import AgentDelegation from '@/components/AgentDelegation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-950 text-white">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-16">
        <div className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          AGENT.FI
        </div>
        <ConnectButton />
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4">
          Self-Custodial <span className="text-blue-500">AI Banking</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Your personal hedge fund, running locally on your machine.
          Powered by Llama 3 and Ethereum.
        </p>
      </div>

      The Agent Dashboard
      <AgentDashboard />
      <AgentDelegation/>
      <DecisionGraph/>
      <AgentWallet/>
    </main>
  );
}