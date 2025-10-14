import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    //walletConnect({ projectId: 'YOUR_PROJECT_ID' }),
    injected(),
    farcasterFrame(),
    //coinbaseWallet(),
  ],
  transports: {
    //[base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
