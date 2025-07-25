import { createConfig, http, injected } from "wagmi";
import { arbitrum, base } from "wagmi/chains";
import { metaMask, walletConnect, safe } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [arbitrum, base], // Ajoute ici les chains que tu veux supporter
  connectors: [
    injected(),
    metaMask(),
    safe(),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "" })
  ],
  transports: {
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});
