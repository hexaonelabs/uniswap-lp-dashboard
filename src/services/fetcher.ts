import { arbitrum, base, Chain } from "viem/chains";

export interface GetPositionsAPIResponse {
  data: DataGetPositionsAPIResponse;
}

interface DataGetPositionsAPIResponse {
  positions: PositionAPIResponse[];
}

export interface PositionAPIResponse {
  // amountCollectedUSD:       string;
  // amountDepositedUSD:       string;
  // amountWithdrawnUSD:       string;
  collectedFeesToken0:      string;
  collectedFeesToken1:      string;
  // collectedToken0:          string;
  // collectedToken1:          string;
  depositedToken0:          string;
  depositedToken1:          string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  id:                       string;
  owner:                    string;
  liquidity:                string;
  pool:                     PoolAPIResponse;
  tickLower:                string;
  tickUpper:                string;
  token0:                   TokenAPIResponse;
  token1:                   TokenAPIResponse;
  transaction:              TransactionAPIResponse;
  withdrawnToken0:          string;
  withdrawnToken1:          string;
}

interface PoolAPIResponse {
  feeTier:   string;
  id:        string;
  liquidity: string;
  sqrtPrice: string;
  tick:      string;
  feeGrowthGlobal0X128:   string;
  feeGrowthGlobal1X128:   string;
}

interface TokenAPIResponse {
  decimals: string;
  id:       string;
  name:     string;
  symbol:   string;
}

interface TransactionAPIResponse {
  timestamp: string;
}

export interface Network extends Chain {
  // id: string;
  name: string;
  desc: string;
  keyMapper: string; // used for Coingecko token mapping
  logoURI: string;
  subgraphEndpoint: string[];
  nonfungiblePositionManagerAddress: string;
  factory: string; // Uniswap V3 Factory address

  // // for pool overview
  totalValueLockedUSD_gte: number;
  volumeUSD_gte: number;
}

export enum SupportedChainId {
  ARBITRUM_ONE = arbitrum.id,
}

export const NETWORKS: Network[] = [
  {
    ...arbitrum,
    name: "Arbitrum",
    desc: "Arbitrum Mainnet (L2)",
    keyMapper: "arbitrum",
    logoURI: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    subgraphEndpoint: [
      import.meta.env.VITE_ARBITRUM_SUBGRAPH_URL,
      import.meta.env.VITE_ARBITRUM_SUBGRAPH_URL_POOLS,
      import.meta.env.VITE_ARBITRUM_SUBGRAPH_URL_TICKS,
    ],
    nonfungiblePositionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    totalValueLockedUSD_gte: 100_000,
    volumeUSD_gte: 50_000,
  },
    {
    ...base,
    name: "Base",
    desc: "Base Mainnet (L2)",
    keyMapper: "base",
    logoURI: `${base.blockExplorers.default.url}/assets/base/images/svg/logos/chain-light.svg`,
    subgraphEndpoint: [
      import.meta.env.VITE_BASE_SUBGRAPH_URL,
      import.meta.env.VITE_BASE_SUBGRAPH_URL_POOLS,
      import.meta.env.VITE_BASE_SUBGRAPH_URL_TICKS,
    ],
    nonfungiblePositionManagerAddress: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    totalValueLockedUSD_gte: 100_000,
    volumeUSD_gte: 50_000,
  },
];

const getNetworkConfigByChainId = (chainId: number): Network => {
  const network = NETWORKS.find((network) => network.id === chainId);
  if (!network) {
    throw new Error(`Network ${chainId} not found`);
  }
  return network;
}

const _queryUniswap = async <T>(query: string, chainId: number): Promise<T> => {
  // cash management logic
  // find the owner of the query
  let salt = query.match(/owner:\s*"([^"]+)"/)?.[1];
  if (!salt) {
    salt = 'pools'; // default salt for pools query
  }
  if (query.includes('ticks')) {
    salt = 'ticks-' + query.match(/id:\s*"([^"]+)"/)?.[1]; // set salt for ticks query
    console.log(`Using salt for ticks query: ${salt}`);
  }
  const key = `uniswap-query-${chainId}-${salt}`;
  // Check if the query is cached less than 15minutes ago
  const cacheTime = 15 * 60 * 1000; // 15 minutes
  const cachedTime = localStorage.getItem(`${key}-time`);
  const cachedResponse = localStorage.getItem(key);
  if (cachedResponse && cachedTime) {
    const now = Date.now();
    if (now - parseInt(cachedTime, 10) < cacheTime) {
      console.log(`Using cached response for ${key}`);
      return JSON.parse(cachedResponse) as T;
    }
  }

  if (!query || !chainId) {
    throw new Error('Query and chainId are required parameters');
  }

  const network = getNetworkConfigByChainId(chainId);
  let endpoint;
  switch (true) {
    case salt === 'pools':
      endpoint = network.subgraphEndpoint[1];
      break;
    case salt.includes('ticks'):
      endpoint = network.subgraphEndpoint[2];
      break;
    default:
      endpoint = network.subgraphEndpoint[0];
      break;
  }
  const req = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    },
    body: JSON.stringify({
      query,
    }),
  });
  const res = await req.json();
  if (res.errors) {
    console.error(`Error fetching data for chain ${chainId}:`, res.errors);
    throw new Error(`Failed to fetch data for chain ${chainId}`);
  }
  // Cache the response
  localStorage.setItem(key, JSON.stringify(res));
  localStorage.setItem(`${key}-time`, Date.now().toString());
  return res as T;
};

export const fetcher = async <T>(query: string, chainId: number): Promise<T> => {
  try {
    const response = await _queryUniswap<T>(query, chainId);
    if (!response) {
      throw new Error(`Invalid response structure for chain ${chainId}`);
    }
    console.log(`Fetched data for chain ${chainId}:`, response);
    return response;
  } catch (error) {
    console.error(`Error fetching data for chain ${chainId}:`, error);
    throw new Error(`Failed to fetch data for chain ${chainId}`);
  }
}