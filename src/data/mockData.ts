import { NETWORKS } from '../services/fetcher';
import { Position, Token, Pool, ChartData } from '../types';

// export const chains: Chain[] = [
//   // {
//   //   id: 1,
//   //   name: 'Ethereum',
//   //   symbol: 'ETH',
//   //   logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
//   //   rpcUrl: 'https://mainnet.infura.io/v3/',
//   //   explorerUrl: 'https://etherscan.io'
//   // },
//   // {
//   //   id: 137,
//   //   name: 'Polygon',
//   //   symbol: 'MATIC',
//   //   logoURI: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
//   //   rpcUrl: 'https://polygon-rpc.com',
//   //   explorerUrl: 'https://polygonscan.com'
//   // },
//   {
//     id: 42161,
//     name: 'Arbitrum',
//     symbol: 'ARB',
//     logoURI: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
//     rpcUrl: 'https://arb1.arbitrum.io/rpc',
//     explorerUrl: 'https://arbiscan.io'
//   },
//   // {
//   //   id: 10,
//   //   name: 'Optimism',
//   //   symbol: 'OP',
//   //   logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
//   //   rpcUrl: 'https://mainnet.optimism.io',
//   //   explorerUrl: 'https://optimistic.etherscan.io'
//   // }
// ];

export const mockTokens: Token[] = [
  {
    address: '0xa0b86a33e6776842ac88f6b0c1f4b87e5e8d0bd2',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    priceUSD: 1.0,
    balance: '1000.0'
  },
  {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
    priceUSD: 2580.0,
    balance: '0.5'
  },
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
    priceUSD: 1.0,
    balance: '500.0'
  },
  {
    address: '0xa0b86a33e6776842ac88f6b0c1f4b87e5e8d0bd2',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
    priceUSD: 1.0,
    balance: '750.0'
  }
];

export const mockPositions: Position[] = [
  {
    id: '1',
    poolAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
    token0: mockTokens[0], // USDC
    token1: mockTokens[1], // WETH
    liquidity: '1000000',
    tickLower: -276324,
    tickUpper: -276320,
    feeGrowthInside0LastX128: '0',
    feeGrowthInside1LastX128: '0',
    tokensOwed0: '0',
    tokensOwed1: '0',
    currentPrice: 2580.0,
    priceRange: { min: 2400.0, max: 2800.0 },
    isInRange: true,
    isOpen: true,
    chain: NETWORKS[0],
    feeTier: 3000,
    createdAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-20T14:25:00Z',
    totalValueUSD: 12500.0,
    feesEarnedUSD: 245.80,
    apr: 15.2,
    impermanentLoss: -2.1,
    token0BalancePercentage: '60.0',
    token1BalancePercentage: '40.0',
    unClaimedFees: {
      token0Fees: '100.0',
      token1Fees: '0.05',
      token0Symbol: 'USDC',
      token1Symbol: 'WETH',
      amountUSD: 100.0
    }
  },
  {
    id: '3',
    poolAddress: '0x11b815efb8f581194ae79006d24e0d814b7697f6',
    token0: mockTokens[1], // WETH
    token1: mockTokens[3], // USDT
    liquidity: '750000',
    tickLower: -276324,
    tickUpper: -276320,
    feeGrowthInside0LastX128: '0',
    feeGrowthInside1LastX128: '0',
    tokensOwed0: '0',
    tokensOwed1: '0',
    currentPrice: 2580.0,
    priceRange: { min: 2300.0, max: 2900.0 },
    isInRange: true,
    isOpen: false,
    chain: NETWORKS[1],
    feeTier: 3000,
    createdAt: '2024-01-05T16:45:00Z',
    lastUpdated: '2024-01-18T11:20:00Z',
    totalValueUSD: 0,
    feesEarnedUSD: 456.90,
    apr: 22.3,
    impermanentLoss: -1.8,
    token0BalancePercentage: '60.0',
    token1BalancePercentage: '40.0',
    unClaimedFees: {
      token0Fees: '100.0',
      token1Fees: '0.05',
      token0Symbol: 'USDC',
      token1Symbol: 'WETH',
      amountUSD: 100.0
    }
  }
];

export const mockPools: Pool[] = [
  {
    address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
    token0: mockTokens[0],
    token1: mockTokens[1],
    feeTier: 3000,
    liquidity: '50000000',
    sqrtPriceX96: '1234567890',
    tick: -276322,
    chain: NETWORKS[0],
    volumeUSD24h: 25000000,
    tvlUSD: 180000000,
    apr: 18.5,
    feesUSD24h: 75000
  },
  {
    address: '0x60594a405d53811d3bc4766596efd80fd545a270',
    token0: mockTokens[0],
    token1: mockTokens[2],
    feeTier: 500,
    liquidity: '30000000',
    sqrtPriceX96: '1234567890',
    tick: -276322,
    chain: NETWORKS[1],
    volumeUSD24h: 15000000,
    tvlUSD: 120000000,
    apr: 12.3,
    feesUSD24h: 18750
  }
];

export const mockChartData: ChartData[] = [
  { date: '2024-01-01', totalValue: 15000, feesEarned: 45, positions: 2 },
  { date: '2024-01-02', totalValue: 15200, feesEarned: 52, positions: 2 },
  { date: '2024-01-03', totalValue: 14800, feesEarned: 58, positions: 2 },
  { date: '2024-01-04', totalValue: 15500, feesEarned: 65, positions: 2 },
  { date: '2024-01-05', totalValue: 20500, feesEarned: 72, positions: 3 },
  { date: '2024-01-06', totalValue: 20800, feesEarned: 89, positions: 3 },
  { date: '2024-01-07', totalValue: 20200, feesEarned: 95, positions: 3 },
  { date: '2024-01-08', totalValue: 20600, feesEarned: 112, positions: 3 },
  { date: '2024-01-09', totalValue: 20900, feesEarned: 128, positions: 3 },
  { date: '2024-01-10', totalValue: 21200, feesEarned: 145, positions: 3 },
  { date: '2024-01-11', totalValue: 20800, feesEarned: 162, positions: 3 },
  { date: '2024-01-12', totalValue: 21500, feesEarned: 178, positions: 3 },
  { date: '2024-01-13', totalValue: 21800, feesEarned: 195, positions: 3 },
  { date: '2024-01-14', totalValue: 21400, feesEarned: 212, positions: 3 },
  { date: '2024-01-15', totalValue: 21700, feesEarned: 228, positions: 3 },
  { date: '2024-01-16', totalValue: 21200, feesEarned: 245, positions: 3 },
  { date: '2024-01-17', totalValue: 20900, feesEarned: 262, positions: 3 },
  { date: '2024-01-18', totalValue: 20700, feesEarned: 458, positions: 2 },
  { date: '2024-01-19', totalValue: 20650, feesEarned: 728, positions: 2 },
  { date: '2024-01-20', totalValue: 20700, feesEarned: 828, positions: 2 }
];