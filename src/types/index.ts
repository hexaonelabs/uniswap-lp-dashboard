import { Network } from "../services/fetcher";

export type TimeFilter = '24h' | '7d' | '30d' | '90d' | 'all';

export interface Position {
  id: string;
  poolAddress: string;
  token0: Omit<Token, 'balance'>;
  token1: Omit<Token, 'balance'>;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  tokensOwed0: string;
  token0BalancePercentage: string;
  tokensOwed1: string;
  token1BalancePercentage: string;
  currentPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  isInRange: boolean;
  isOpen: boolean;
  chain: Network;
  feeTier: number;
  createdAt: string;
  lastUpdated: string;
  totalValueUSD: number;
  feesEarnedUSD: number;
  unClaimedFees: {
    token0Fees: string;
    token1Fees: string;
    token0Symbol: string;
    token1Symbol: string;
    amountUSD: number;
  },
  apr: number;
  impermanentLoss: number;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  priceUSD: number;
  balance: string;
}

export interface Pool {
  address: string;
  token0: Token;
  token1: Token;
  feeTier: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  chain: Network;
  volumeUSD24h: number;
  tvlUSD: number;
  apr: number;
  feesUSD24h: number;
}

export interface ChartData {
  date: string;
  totalValue: number;
  feesEarned: number;
  positions: number;
}

export interface FilterOptions {
  status: 'all' | 'open' | 'closed';
  range: 'all' | 'in' | 'out';
  chain: string;
  sortBy: 'value' | 'fees' | 'apr' | 'created';
  sortOrder: 'asc' | 'desc';
}