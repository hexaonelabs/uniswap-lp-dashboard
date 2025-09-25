export const getPosition = (id: string) => `
{
  position(id: "${id}") {
    id
    owner
    liquidity
    tickLower
    tickUpper
    depositedToken0
    depositedToken1
    withdrawnToken0
    withdrawnToken1
    feeGrowthInside0LastX128
    feeGrowthInside1LastX128
    collectedFeesToken0
    collectedFeesToken1
    collectedToken0
    collectedToken1
    transaction {
      timestamp
    }
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
    amountCollectedUSD
    amountWithdrawnUSD
    amountDepositedUSD

    pool {
      id
      feeTier
      liquidity
      tick
      sqrtPrice
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
    }
  }
}
`;

export const getPositions = (owner: string) => `
{
  positions(where: {
    owner: "${owner}"
  }, first: 1000, skip: 0){
    id
    owner
    liquidity
    tickLower
    tickUpper
    depositedToken0
    depositedToken1
    withdrawnToken0
    withdrawnToken1
    feeGrowthInside0LastX128
    feeGrowthInside1LastX128
    collectedFeesToken0
    collectedFeesToken1
    transaction {
      timestamp
    }
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }

    pool {
      id
      feeTier
      liquidity
      tick
      sqrtPrice
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
    }
  }
}`;

export const getPools = (first: number, totalValueLockedUSD_gte: number, volumeUSD_gte: number) => `
{
      pools (first: ${first}, orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: ${totalValueLockedUSD_gte}, volumeUSD_gte: ${volumeUSD_gte}}) {
        id
        token0 {
          id
          name
          symbol
          volumeUSD
          decimals
          totalValueLockedUSD
          poolCount
        }
        token1 {
          id
          name
          symbol
          volumeUSD
          decimals
          totalValueLockedUSD
          poolCount
        }
        feeTier
        liquidity
        tick
        totalValueLockedUSD
        poolDayData(first: 15, skip: 1, orderBy: date, orderDirection: desc) {
          date
          volumeUSD
          open 
          high
          low
          close
        }
      }
    }
`;

export const getPoolTicks = (poolId: string, first = 1000) => `
  {
    pool(id: "${poolId.toLowerCase()}") {
      ticks(first: ${first}, orderBy: tickIdx, orderDirection: asc) {
        tickIdx
        liquidityNet
        liquidityGross
      }
    }
  }
`;