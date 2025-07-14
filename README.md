# Uniswap LP Dashboard

A modern and interactive dashboard for tracking and analyzing your Uniswap V3 liquidity positions across multiple chains.

## 🌟 Features

- **Multi-chain Support**: Track positions on Arbitrum and Base with extensible architecture
- **Real-time Analytics**: Live position monitoring with advanced metrics
- **Projection Calculator**: Revenue estimations and scenario simulations
- **ENS Resolution**: Support for Ethereum addresses and ENS names
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Advanced Filtering**: Sort by status, chain, value, APR, and more
- **Detailed Metrics**: APR calculations, unclaimed fees, impermanent loss tracking

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Viem for EVM interactions
- **Uniswap**: V3 SDK for position calculations
- **Build Tool**: Vite
- **APIs**: The Graph Protocol for Uniswap data

## 📋 Prerequisites

- Node.js 18+
- npm

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/uniswap-lp-dashboard.git
cd uniswap-lp-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your API key to `.env`:
```env
VITE_API_KEY=your_thegraph_api_key_here
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🌐 Supported Networks

The dashboard currently supports:

- **Arbitrum**: Layer 2 solution with low fees
- **Base**: Coinbase's Layer 2 network

Network configurations are defined in `NETWORKS` array.

## 📊 Data Sources

- **The Graph Protocol**: Decentralized indexing for Uniswap V3 data
- **LiFi SDK**: Token price and metadata
- **Viem**: On-chain data fetching

## 🔗 API Integration

The app integrates with Uniswap V3 subgraphs via `fetcher` service:

```typescript
const response = await fetcher(getPositions(address), chainId);
```

Position data is formatted and enhanced with real-time calculations in `getPositionsData`.

## 🎯 Usage

1. Enter an Ethereum address or ENS name in the header
2. View your liquidity positions across supported chains
3. Use filters to focus on specific position types
4. Click "Calculator" on any position for projections
5. Explore "Best Pools" tab for new opportunities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Uniswap V3](https://uniswap.org/) for the DEX protocol
- [The Graph](https://thegraph.com/) for decentralized indexing
- [Viem](https://viem.sh/) for Ethereum interactions
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Note**: This dashboard is for informational purposes only. Always verify transactions and understand the risks of providing liquidity before making financial decisions.