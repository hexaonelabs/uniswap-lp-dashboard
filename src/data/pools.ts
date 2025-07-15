import bn from "bignumber.js";
import { fetcher, Network, NETWORKS } from "../services/fetcher";
import { getPools } from "../services/querys";
import { GetPoolsAPIResponse, PoolAPIResponse, PoolColumnDataType, PoolDayData, PoolDayDatumAPIResponse, Risk, RiskChecklist, Token } from "../types";
import BigNumber from 'bignumber.js';
import { getTokens } from "@lifi/sdk";
import { getFeeTierPercentage, getTokenLogoURL } from "../utils/uniswap/helper";
import { getLiquidityDelta, getPriceFromTick } from "../utils/uniswap/math";

export const getPoolsData = async (
  totalValueLockedUSD_gte: number,
  volumeUSD_gte: number,
  chainId: number,
  first = 10
): Promise<{
  pools: PoolColumnDataType[];
  tokens: Token[];
}> => {
  const chain = NETWORKS.find((network) => network.id === chainId);
  if (!chain) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }
  try {
    const res = await fetcher<GetPoolsAPIResponse>(
      getPools(
        first,
        totalValueLockedUSD_gte,
        volumeUSD_gte
      ),
      chainId
    );

    if (res === undefined || !res.data || !res.data.pools || res.data.pools.length === 0) {
      return { pools: [], tokens: [] };
    }
    // const getUniqueItems = (arr: string[]): string[] => {
    //   return arr.filter((v, i, a) => a.indexOf(v) === i);
    // };
    // const tokenIds = getUniqueItems(
    //   res.data.pools.reduce(
    //     (acc: string[], p) => {
    //       return [
    //         ...acc,
    //         p.token0.id,
    //         p.token1.id,
    //       ]
    //     },
    //     [] 
    //   )
    // );
    // const queryPage = Math.ceil(tokenIds.length / 100);
    // // batch query getBulkTokens function by page using Promise.all
    // const tokens = await Promise.all(
    //   Array.from({ length: queryPage }, (_, i) => {
    //     const start = i * 100;
    //     const end = start + 100;
    //     return getBulkTokens(tokenIds.slice(start, end), chainId);
    //   })
    // ).then((res) => res.flat());
    // sort token by volume
    // tokens.sort((a, b) => Number(b.volumeUSD) - Number(a.volumeUSD));
    // // map poolCount
    // const poolCountByTokenHash = res.data.pools.reduce((acc: {
    //   [key: string]: number;
    // }, p) => {
    //   acc[p.token0.id] = (acc[p.token0.id] || 0) + 1;
    //   acc[p.token1.id] = (acc[p.token1.id] || 0) + 1;
    //   return acc;
    // }, {});
    // const _tokens = tokens.map((t: Token) => {
    //   return {
    //     ...t,
    //     poolCount: poolCountByTokenHash[t.id],
    //   };
    // });
    // // create hash of tokens id
    // const tokenHash = _tokens.reduce((acc: any, t: Token) => {
    //   acc[t.id] = t;
    //   return acc;
    // }, {});
    // map token0 and token1 to pool
    
    const pools = res.data.pools
      // fix poolDayData incorrect data
      .map((p) => {
        const poolDayData = [];
        for (let i = 0; i < p.poolDayData.length - 1; ++i) {
          p.poolDayData[i].open = p.poolDayData[i + 1].close;
          poolDayData.push(p.poolDayData[i]);
        }
        p.poolDayData = poolDayData;
        return p;
      })
      // filter out if poolDayData < 14
      .filter((p) => p.poolDayData.length === 14);
    // formating pools data
    const result = { pools: await _processPools(pools, chain), tokens: [] };
    return {
      pools: (result.pools.map((pool) => ({...pool, chain }))),
      tokens: result.tokens,
    };
  } catch (e) {
    console.error("Error fetching pools data:", e);
    return { pools: [], tokens: [] };
  }
};

const _processPools = async (allPools: PoolAPIResponse[], chain: Network): Promise<PoolColumnDataType[]> => {
    const {tokens: tokensAvailables} = await getTokens({
      chains: [chain.id],
      minPriceUSD: 0.01,
    });
  const tokens = tokensAvailables[chain.id] || [];
  const topPools = allPools.map( async (pool, index) => {
    // Basic Stats
    const poolDayData7d = pool.poolDayData.slice(0, 7);
    const totalValueLockedUSD = Number(pool.totalValueLockedUSD);
    const volume24h = Number(poolDayData7d[0].volumeUSD);
    const volume7d = poolDayData7d.reduce((acc, cur) => {
      return acc + Number(cur.volumeUSD);
    }, 0);
    const dailyVolumePerTVL = volume7d / 7 / totalValueLockedUSD;
    const fee24h = (volume7d / 7) * getFeeTierPercentage(pool.feeTier);
    const dailyFeesPerTVL = fee24h / totalValueLockedUSD;

    // Price Volatility
    const poolDayData14d = pool.poolDayData;
    const priceVolatility24HPercentage: number =
      poolDayData14d
        .map((d: PoolDayDatumAPIResponse) => {
          return (100 * (Number(d.high) - Number(d.low))) / Number(d.high);
        })
        .reduce((a, b) => a + b, 0) / 14;
    const poolDayDatas = pool.poolDayData;

    // Risk
    const riskChecklist: RiskChecklist = {
      lowPoolTVL: totalValueLockedUSD < 10000000,
      lowPoolVolume: dailyVolumePerTVL < 0.1,
      highPriceVolatility: priceVolatility24HPercentage > 10,
      lowToken0TVL: Number(pool.token0.totalValueLockedUSD) < 10_000_000,
      lowToken0PoolCount: Number(pool.token0.poolCount) < 5,
      lowToken1TVL: Number(pool.token1.totalValueLockedUSD) < 10_000_000,
      lowToken1PoolCount: Number(pool.token1.poolCount) < 5,
    };
    const riskChecklistCount = Object.values(riskChecklist).filter(
      (v) => v === true
    ).length;
    let risk = Risk.SAFE;
    if (riskChecklistCount >= 1) risk = Risk.LOW_RISK;
    if (riskChecklistCount >= 4) risk = Risk.HIGH_RISK;

    const token0 = tokens.find((token) => token.address.toLowerCase() === pool.token0.id.toLowerCase()) || {
      priceUSD: `0`,
      logoURI: getTokenLogoURL(chain.keyMapper, pool.token0.id)
    };
    const token1 = tokens.find((token) => token.address.toLowerCase() === pool.token1.id.toLowerCase()) || {
      priceUSD: `0`,
      logoURI: getTokenLogoURL(chain.keyMapper, pool.token1.id)
    };
    const { estimatedFee24h, amount0, amount1 } = await calculatePoolEstimatedFees(
      1000,
      {...pool, 
        token0: {
          ...pool.token0,
          priceUSD: token0.priceUSD || '0',
        },
        token1: {
          ...pool.token1,
          priceUSD: token1.priceUSD || '0',
        },
      }
    );
    const fee1y = (estimatedFee24h || 0) * 365;
    return <PoolColumnDataType>{
      key: index.toString(),
      poolId: pool.id,
      feeTier: pool.feeTier,
      token0: {
        address: pool.token0.id,
        symbol: pool.token0.symbol,
        name: pool.token0.name,
        logoURI: token0.logoURI,
        decimals: Number(pool.token0.decimals),
        priceUSD: token0.priceUSD || 0,
      },
      token1: {
        address: pool.token1.id,
        symbol: pool.token1.symbol,
        name: pool.token1.name,
        logoURI: token1.logoURI,
        decimals: Number(pool.token1.decimals),
        priceUSD: token1.priceUSD || 0,
      },
      totalValueLockedUSD,
      volume24h,
      volume7d,
      dailyVolumePerTVL,
      fee24h,
      priceVolatility24HPercentage,
      poolDayDatas,
      dailyFeesPerTVL,
      risk,
      riskChecklist,
      estimatedFee24h,
      estimatedFeeToken0: amount1,
      estimatedFeeToken1: amount0,
      apy: Number((100 * (fee1y / 1000)).toFixed(2)),

    };
  });

  return Promise.all(topPools);
};

export const calculatePoolEstimatedFees = async (
  depositAmountUSD: number,
  pool: PoolAPIResponse & {
    token0: {
      decimals: string;
      priceUSD: string;
    };
    token1: {
      decimals: string;
      priceUSD: string;
    };
  }
) => {
  // Basic Stats
  const poolDayData7d = pool.poolDayData.slice(0, 7);
  const volume24h = Number(poolDayData7d[0].volumeUSD);
  // Price Volatility
  const poolDayData14d = pool.poolDayData;
  const priceVolatility24HPercentage: number =
    poolDayData14d
      .map((d: PoolDayData) => {
        return (100 * (Number(d.high) - Number(d.low))) / Number(d.high);
      })
      .reduce((a, b) => a + b, 0) / 14;
  const P = getPriceFromTick(
    Number(pool.tick),
    pool.token0.decimals,
    pool.token1.decimals
  );
  const Pl = P - (P * priceVolatility24HPercentage) / 100;
  const Pu = P + (P * priceVolatility24HPercentage) / 100;
  const priceUSDX = Number(pool.token1.priceUSD);
  const priceUSDY = Number(pool.token0.priceUSD);
  const { amount0, amount1 } = getTokensAmountFromDepositAmountUSD(
    P,
    Pl,
    Pu,
    priceUSDX,
    priceUSDY,
    depositAmountUSD
  );
  const deltaL = getLiquidityDelta(
    P,
    Pl,
    Pu,
    amount0,
    amount1,
    Number(pool.token0?.decimals || 18),
    Number(pool.token1?.decimals || 18)
  );
  const L = new BigNumber(pool.liquidity);
  const volume24H = volume24h;
  const feeTier = pool.feeTier;
  const estimatedFee24h =
    P >= Pl && P <= Pu ? estimateFee(deltaL, L, volume24H, feeTier) : 0;
  // console.log(`fees estimated for pool ${pool.id}: `, {
  //   estimatedFee24h,
  //   amount0,
  //   amount1,
  // });
  
  return {
    estimatedFee24h,
    amount0,
    amount1,
  };
};

export const estimateFee = (
  liquidityDelta: bn,
  liquidity: bn,
  volume24H: number,
  feeTier: string
): number => {
  const feeTierPercentage = getFeeTierPercentage(feeTier);
  const liquidityPercentage = liquidityDelta
    .div(liquidity.plus(liquidityDelta))
    .toNumber();

  return feeTierPercentage * volume24H * liquidityPercentage;
};

export const getTokensAmountFromDepositAmountUSD = (
  P: number,
  Pl: number,
  Pu: number,
  priceUSDX: number,
  priceUSDY: number,
  depositAmountUSD: number
): {
  amount0: number;
  amount1: number;
  liquidityDelta: number;
} => {
  const deltaL =
    depositAmountUSD /
    ((Math.sqrt(P) - Math.sqrt(Pl)) * priceUSDY +
      (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu)) * priceUSDX);

  let deltaY = deltaL * (Math.sqrt(P) - Math.sqrt(Pl));
  if (deltaY * priceUSDY < 0) deltaY = 0;
  if (deltaY * priceUSDY > depositAmountUSD)
    deltaY = depositAmountUSD / priceUSDY;

  let deltaX = deltaL * (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu));
  if (deltaX * priceUSDX < 0) deltaX = 0;
  if (deltaX * priceUSDX > depositAmountUSD)
    deltaX = depositAmountUSD / priceUSDX;

  return { amount0: deltaX, amount1: deltaY, liquidityDelta: deltaL };
};


