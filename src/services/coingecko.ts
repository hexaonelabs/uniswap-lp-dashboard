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

  const marketChartRes = (await axios.get(
    `https://api.coingecko.com/api/v3/coins/${token.id}/market_chart?vs_currency=usd&days=${queryPeriod}`
  )) as any;

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