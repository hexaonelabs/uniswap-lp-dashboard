import { fetcher, NETWORKS, PositionAPIResponse } from "../services/fetcher"
import { getPositions } from "../services/querys"
import { Position } from "../types";
import nonfungiblePositionManagerAbi from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Pool as V3Pool, Position as V3Position } from "@uniswap/v3-sdk";
import { Token as V3Token } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";
import { simulateContract } from 'viem/actions';

import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  // parseAbi,
  // AbiEvent,
} from "viem";
import * as chains from "viem/chains";
import { getToken } from "@lifi/sdk";


export const getPositionsData = async (owner: string, chainId: number = chains.arbitrum.id) => {
  const response = fetcher(getPositions(owner), chainId);
  const data = await response;
  return _formatPositions(data.data.positions, chainId);
}

const _formatPositions = async (positions: PositionAPIResponse[], chainId: number):Promise<Position[]> => {
  const formatedPositions: Position[] = [];
  // search into chains the selected chain by Id
  const chain = NETWORKS.find((network) => network.id === chainId);
  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  // Loop through each position and format it
  for (const position of positions) {
    const token0 = await getToken(chainId, position.token0.symbol).catch((error) => {
      console.error(`Error fetching token0 for position ${position.id}:`, error);
      return {
        priceUSD: '0',
        logoURI: '',
      };
    });
    const token1 = await getToken(chainId, position.token1.symbol).catch((error) => {
      console.error(`Error fetching token1 for position ${position.id}:`, error);
      return {
        priceUSD: '0',
        logoURI: '',
      };
    });
    const fees = await getFormattedUnclaimedFees(
      position, chainId
    );
    const v3token0 = new V3Token(
      chainId,
      position.token0.id,
      Number(position.token0.decimals),
      position.token0.symbol
    );
    const v3token1 = new V3Token(
      chainId,
      position.token1.id,
      Number(position.token1.decimals),
      position.token1.symbol
    );
    const v3Pool = new V3Pool(
        v3token0,
        v3token1,
        +position.pool.feeTier,
        position.pool.sqrtPrice, // sqrtPriceX96
        position.pool.liquidity,
        +position.pool.tick // tick
      );
    const v3Position = new V3Position({
      pool: v3Pool,
      liquidity: position.liquidity.toString(),
      tickLower: +position.tickLower,
      tickUpper: +position.tickUpper,
    });
    const collectedFeesToken0AmountUSD = (parseFloat(position.collectedFeesToken0) * Number(token0.priceUSD));
    const collectedFeesToken1AmountUSD = (parseFloat(position.collectedFeesToken1) * Number(token1.priceUSD));
    const collectedFeesAmountUSD = collectedFeesToken0AmountUSD + collectedFeesToken1AmountUSD;
    
    const unclaimedFeesAmountUSD = (Number(token0.priceUSD) * parseFloat(fees.token0Fees)) + (Number(token1.priceUSD) * parseFloat(fees.token1Fees));
    const totalAllFeesUSD = collectedFeesAmountUSD + unclaimedFeesAmountUSD;
    const totalLiquidityUSD = +v3Position.amount0.toSignificant(4) * Number(token0.priceUSD) + +v3Position.amount1.toSignificant(4) * Number(token1.priceUSD);
    const apy = calculateAPY(
      totalLiquidityUSD, totalAllFeesUSD, new Date(Number(position.transaction.timestamp )* 1000)
    );
    const isInRange = v3Position.tickLower <= v3Position.pool.tickCurrent && v3Position.tickUpper >= v3Position.pool.tickCurrent;
    const valuePercentageOf = (value: number, total: number) => {
      if (total === 0) return 0;
      return ((value / total) * 100);
    };
    const ilAMountUSD = (Number(position.depositedToken0) * Number(token0.priceUSD)) + (Number(position.depositedToken1) * Number(token1.priceUSD)) - totalLiquidityUSD;
    const impermanentLoss = valuePercentageOf(ilAMountUSD, totalLiquidityUSD);
    const token0BalancePercentage = valuePercentageOf(
      Number(v3Position.amount0.toSignificant(4)) * Number(token0.priceUSD),
      totalLiquidityUSD
    ).toFixed(0);
    const token1BalancePercentage = valuePercentageOf(
      Number(v3Position.amount1.toSignificant(4)) * Number(token1.priceUSD),
      totalLiquidityUSD
    ).toFixed(0);
    
// console.log("feeGrowthInside0Last (décimal):", feeGrowthInside0Last);

    const formattedPosition: Position = {
      id: position.id,
      liquidity: position.liquidity,
      tickLower: Number(position.tickLower),
      tickUpper: Number(position.tickUpper),
      depositedToken0: position.depositedToken0,
      depositedToken1: position.depositedToken1,
      withdrawnToken0: position.withdrawnToken0,
      withdrawnToken1: position.withdrawnToken1,
      feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
      feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
      // collectedFeesToken0: position.collectedFeesToken0,
      // collectedFeesToken1: position.collectedFeesToken1,
      // collectedToken0: position.collectedToken0,
      // collectedToken1: position.collectedToken1,
      // amountCollectedUSD: position.amountCollectedUSD,
      // amountWithdrawnUSD: position.amountWithdrawnUSD,
      // amountDepositedUSD: position.amountDepositedUSD,
      poolAddress: position.pool.id,
      feeTier: Number(position.pool.feeTier),
      currentPrice: Number(v3Position.pool.token0Price) > 0.01 ? Number(v3Position.pool.token0Price.toFixed(2)) : Number(v3Position.pool.token0Price.toFixed(6)),
      priceRange: {
        min: Number(v3Position.token0PriceLower) > 0.01 ? Number(v3Position.token0PriceLower.toFixed(2)) : Number(v3Position.token0PriceLower.toFixed(6)),
        max: Number(v3Position.token0PriceUpper) > 0.01 ? Number(v3Position.token0PriceUpper.toFixed(2)) : Number(v3Position.token0PriceUpper.toFixed(6))
      },
      isInRange, // This can be determined based on the current price and tick
      isOpen: Number(position.liquidity || 0) > 0 ? true : false, // This can be determined based on the liquidity and other factors
      totalValueUSD: totalLiquidityUSD || 0,
      feesEarnedUSD: totalAllFeesUSD || 0,
      unClaimedFees: {
        ...fees,
        amountUSD: unclaimedFeesAmountUSD || 0,
      },
      apr: apy, // This can be calculated based on the fees earned and total value
      impermanentLoss, // This can be calculated based on the price changes of the tokens
      lastUpdated: new Date().toISOString(), // This can be set to the current time or the last transaction time
      createdAt: new Date(Number(position.transaction.timestamp )* 1000).toISOString(),
      tokensOwed0: v3Position.amount0.toSignificant(4),
      token0BalancePercentage,
      tokensOwed1: v3Position.amount1.toSignificant(4),
      token1BalancePercentage,
      chain,
      token0: {
        address: position.token0.id,
        symbol: position.token0.symbol,
        name: position.token0.name,
        decimals: parseInt(position.token0.decimals, 10),
        priceUSD: Number(token0.priceUSD || 0),
        logoURI: token0.logoURI || ''
      },
      token1: {
        address: position.token1.id,
        symbol: position.token1.symbol,
        name: position.token1.name,
        decimals: parseInt(position.token1.decimals, 10),
        priceUSD: Number(token1.priceUSD || 0),
        logoURI: token1.logoURI || ''
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formattedPosition as any).fees = fees;
    formatedPositions.push(formattedPosition);
  }
  return formatedPositions;
}

/**
 * Calcule les frais non réclamés pour une position Uniswap V3
 * @param position - Les données de la position
 * @returns Les frais non réclamés pour token0 et token1
 */
const calculateUnclaimedFees = async (
  position: PositionAPIResponse,
  chainId: number
) => {
  const chain = NETWORKS.find((network) => network.id === chainId);
  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }
  const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1);
  const client = createPublicClient({
      chain: chain,
      transport: chain.rpcUrls.default.http[0] ? http(chain.rpcUrls.default.http[0]) : http(),
    });
  const positionManagerContractAddress = NETWORKS.find((network) => network.id === chainId)?.nonfungiblePositionManagerAddress;
  if (!positionManagerContractAddress) {
    throw new Error(`NonfungiblePositionManager address not found for chainId ${chainId}`);
  }
  if ((Number(position.liquidity || 0) <= 0)) {
    return {
      unclaimedFees0: '0',
      unclaimedFees1: '0'
    };
  }

  const collectResult = await simulateContract(client, {
    address: positionManagerContractAddress as `0x${string}`,
    abi: nonfungiblePositionManagerAbi.abi,
    functionName: 'collect',
    args: [{
      tokenId: position.id,
      recipient: position.owner,
      amount0Max: MAX_UINT128,
      amount1Max: MAX_UINT128,
    }],
    account: position.owner as `0x${string}`, // le propriétaire du NFT
  }).catch((error) => {
    console.error(`Error in collect simulation on chain ${client.chain.id}:`, error);
    return { result: [BigNumber.from(0), BigNumber.from(0)] };
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unclaimedFee0Wei = +(collectResult.result[0] as any).toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unclaimedFee1Wei = +(collectResult.result[1] as any).toString();
  const unclaimedFee0 = unclaimedFee0Wei / 10 ** Number(position.token0.decimals);
  const unclaimedFee1 = unclaimedFee1Wei / 10 ** Number(position.token1.decimals);
  return {
    unclaimedFees0: unclaimedFee0.toString(),
    unclaimedFees1: unclaimedFee1.toString()
  };
};

/**
 * Calcule et formate les frais non réclamés pour une position
 * @param position - Les données de la position
 * @param currentFeeGrowthInside0X128 - La croissance actuelle des frais pour token0
 * @param currentFeeGrowthInside1X128 - La croissance actuelle des frais pour token1
 * @returns Les frais formatés pour affichage
 */
const getFormattedUnclaimedFees = async (
  position: PositionAPIResponse,
  chainId: number
) => {
  const { unclaimedFees0, unclaimedFees1 } = await calculateUnclaimedFees(
    position, chainId
  );

  return {
    token0Fees: unclaimedFees0,
    token1Fees: unclaimedFees1,
    token0Symbol: position.token0.symbol,
    token1Symbol: position.token1.symbol
  };
};

export const calculateAPY = (liquidity: number, totalFees: number, creationDate: Date): number => {
  const currentDate = new Date();
  const daysActive = (currentDate.getTime() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24);

  if (daysActive <= 0 || liquidity <= 0) {
    return 0; // Évite les divisions par zéro ou des résultats invalides
  }

  const apy = (totalFees / liquidity) * (365 / daysActive) * 100;
  return parseFloat(apy.toFixed(2)); // Retourne l'APY avec deux décimales
}

export const validateAndResolveAddress = async (input: string): Promise<string | null> => {
  const trimmedInput = input.trim()
  
  // check if the input is a valid EVM address
  if (isAddress(trimmedInput)) {
    try {
      return getAddress(trimmedInput) // Retourne l'adresse checksummed
    } catch {
      return null
    }
  }

  // Check if the input is an ENS name or a domain
  if (trimmedInput.endsWith('.eth') || trimmedInput.includes('.')) {
    try {
      const client = createPublicClient({
        chain: chains.mainnet,
        transport: http()
      })
      
      const resolvedAddress = await client.getEnsAddress({ name: trimmedInput })
      return resolvedAddress ? getAddress(resolvedAddress) : null
    } catch {
      return null
    }
  }
  
  return null
}

/**
 * Validation simple d'une adresse EVM
 * @param address - L'adresse à valider
 * @returns true si l'adresse est valide
 */
export const isValidEvmAddress = (address: string): boolean => {
  return isAddress(address)
}