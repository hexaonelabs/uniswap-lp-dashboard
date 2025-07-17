/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import tokenAddressMapping from "../data/tokenAddressMapping.json";
import { NETWORKS } from "./fetcher";

export interface Price {
  timestamp: number;
  value: number;
}

export interface PriceChart {
  tokenId: string;
  tokenName: string;
  currentPriceUSD: number;
  prices: Price[];
}


export const getCoingeckoToken = (contractAddress: string, chainId: number): {
  id: string;
  name: string;
} | null => {
  const mapper = tokenAddressMapping as { [key: string]: any };
  const currentPlatform = NETWORKS.find((network) => network.id === chainId)?.keyMapper;
  if (!currentPlatform) {
    console.warn(`No Coingecko platform found for chainId ${chainId}`);
    return null;
  }
  if (!mapper[currentPlatform]) {
    console.warn(`No Coingecko mapping found for platform ${currentPlatform}`);
    return null;
  }
  const result = mapper[currentPlatform][contractAddress];
  if (result) {
    return result as {
      id: string;
      name: string;
    };
  }
  const keys = Object.keys(mapper);
  for (let i = 0; i < keys.length; ++i) {
    const r = mapper[keys[i]][contractAddress];
    if (r) return r;
  }
  return null;
};

export enum QueryPeriodEnum {
  ONE_DAY = "1",
  ONE_WEEK = "7",
  ONE_MONTH = "30",
  THREE_MONTH = "90",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  ONE_YEAR = "90",
  MAX = "max",
}
export const getPriceChart = async (
  contractAddress: string,
  chainId: number,
  queryPeriod: QueryPeriodEnum = QueryPeriodEnum.ONE_MONTH
): Promise<PriceChart | null> => {
  const token = getCoingeckoToken(contractAddress, chainId);
  if (!token) return null;
  let marketChartRes;
  // check if marketChartRes exist in localstorage for less than 12hours
  const cachedData = localStorage.getItem(`coingecko_market_chart_${token.id}_${queryPeriod}`);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData) as {data: PriceChart};
    const lastTimestamp = parsedData.data.prices[parsedData.data.prices.length - 1].timestamp;
    const currentTime = Date.now();
    // if last timestamp is less than 12 hours ago, return cached data
    if (currentTime - lastTimestamp < 12 * 60 * 60 * 1000) {
      marketChartRes = parsedData;
    }
  }

  // rate limit to 25 calls per minute
  await coinGeckoLimiter.canMakeCall();
    
  marketChartRes = (await axios.get(
    `https://api.coingecko.com/api/v3/coins/${token.id}/market_chart?vs_currency=usd&days=${queryPeriod}`
  )) as any;
  if (!marketChartRes || !marketChartRes.data || !marketChartRes.data.prices) {
    console.warn(`No price data found for token ${token.id} on chain ${chainId}`);
    return null;
  }
  if (marketChartRes.data.prices.length === 0) {
    console.warn(`No price data found for token ${token.id} on chain ${chainId} for period ${queryPeriod}`);
    return null;
  }
  // cache the data in localstorage for 12 hours
  localStorage.setItem(`coingecko_market_chart_${token.id}_${queryPeriod}`, JSON.stringify(marketChartRes));
  const prices = marketChartRes.data.prices.map(
    (d: any) =>
      ({
        timestamp: d[0],
        value: d[1],
      } as Price)
  );

  return {
    tokenId: token.id,
    tokenName: token.name,
    currentPriceUSD: prices[prices.length - 1].value,
    prices,
  };
};

class RateLimiter {
  private calls: number[] = [];
  private maxCalls: number;
  private windowMs: number;

  constructor(maxCalls: number = 25, windowMinutes: number = 1) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMinutes * 60 * 1000;
  }

  async canMakeCall(): Promise<boolean> {
    const now = Date.now();
    this.calls = this.calls.filter(call => now - call < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.windowMs - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.canMakeCall();
    }
    
    this.calls.push(now);
    return true;
  }
}

const coinGeckoLimiter = new RateLimiter(25, 1); // 25 calls per minute