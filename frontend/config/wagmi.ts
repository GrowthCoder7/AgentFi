// frontend/config/wagmi.ts
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains'; // <--- ONLY import sepolia
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia], // <--- Remove 'foundry' or 'localhost' if present
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(), // <--- Ensure this is set
  },
});