import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    walletConnect({ projectId: import.meta.env.WC_PROJECT_ID || '' }),
    injected(),
    farcasterFrame(),
    coinbaseWallet({ 
      appName: 'Kick the Market', 
      appLogoUrl: 'https://kickthemarket.vercel.app/logo.png' 
    }),
  ],
  transports: {
    //[base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
