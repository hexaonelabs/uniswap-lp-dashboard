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
