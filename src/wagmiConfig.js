import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID || '' }),
    injected(),
    farcasterFrame(),
    coinbaseWallet({ 
      appName: 'Kick the Market', 
      appLogoUrl: 'https://kickthemarket.vercel.app/logo.png' 
    }),
  ],
  transports: {
    //[baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_URL),
    [base.id]: http(import.meta.env.VITE_BASE_URL),
  },
});
