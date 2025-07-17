import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePools } from "../hooks/usePools";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Settings,
  Clock,
  Calculator,
  ExternalLink,
  PlusCircle,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";
import { getPriceChart, QueryPeriodEnum } from "../services/coingecko";
import { SimulationControlsPanel } from "../components/SimulationControlsSimulationControlsPanel";
import { ChartPanel } from "../components/ChartPanel";
import { MetricsCard } from "../components/MetricsCard";
import { VolumeChart } from "../components/positions/VolumeChart";
import { NETWORKS } from "../services/fetcher";
import DexScreenerIcon from "../assets/icons/dexscreener.svg";
import ScanExplorerIcon from "../assets/icons/scanexplorer.svg";

export interface FeeCalculationParams {
  volume: number;
  feeTier: number; // en unités (ex: 3000 pour 0.3%)
  liquidityAmount: number;
  totalValueLocked: number;
  currentPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  isFullRange: boolean;
}

export interface FeeEstimateResult {
  estimatedFees: number;
  liquidityConcentration: number;
  liquidityShare: number;
  baseFees: number;
  isInRange: boolean;
}

export const calculateEstimatedFees = (
  params: FeeCalculationParams
): FeeEstimateResult => {
  const {
    volume,
    feeTier,
    liquidityAmount,
    totalValueLocked,
    currentPrice,
    priceRangeMin,
    priceRangeMax,
    isFullRange,
  } = params;

  // Calcul du pourcentage de frais (ex: 3000 -> 0.003 = 0.3%)
  const feeTierPercentage = feeTier / 1000000;

  // Frais de base générés par le volume
  const baseFees = volume * feeTierPercentage;

  // Part de liquidité dans le pool
  const liquidityShare =
    totalValueLocked > 0 ? liquidityAmount / totalValueLocked : 0;

  // Calcul de la concentration de liquidité
  let liquidityConcentration = 1;
  if (!isFullRange && priceRangeMin < priceRangeMax && currentPrice > 0) {
    const rangeSize = (priceRangeMax - priceRangeMin) / currentPrice;
    // Plus la range est petite, plus la concentration est élevée
    liquidityConcentration = Math.min(1 / Math.max(rangeSize, 0.01), 10);
  }

  // Vérifier si le prix actuel est dans la range
  const isInRange = true;
  // isFullRange || (currentPrice >= priceRangeMin && currentPrice <= priceRangeMax);

  // Calcul des frais estimés
  const estimatedFees =
    baseFees * liquidityShare * (isInRange ? liquidityConcentration : 0);

  return {
    estimatedFees,
    liquidityConcentration,
    liquidityShare,
    baseFees,
    isInRange,
  };
};

export const calculateFeesForPeriod = (
  volumeData: number[],
  params: Omit<FeeCalculationParams, "volume">
): FeeEstimateResult[] => {
  return volumeData.map((volume) =>
    calculateEstimatedFees({ ...params, volume })
  );
};

export const calculateAPY = (
  estimatedFees: number,
  liquidityAmount: number,
  timeframeDays: number
): number => {
  if (liquidityAmount === 0 || timeframeDays === 0) return 0;

  return (estimatedFees / liquidityAmount) * (365 / timeframeDays) * 100;
};

export const EstimateEarningsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId");
  const poolAddress = searchParams.get("poolAddress");

  const { pools, loading } = usePools();
  const [liquidityAmount, setLiquidityAmount] = useState(
    Number(searchParams.get("liquidityAmount") || 1_000)
  );
  const [timeframe, setTimeframe] = useState(14);

  const [isFullRange, setIsFullRange] = useState(false);
  const [priceRangeMin, setPriceRangeMin] = useState(
    Number(searchParams.get("minPrice") || 0)
  );
  const [priceRangeMax, setPriceRangeMax] = useState(
    Number(searchParams.get("maxPrice") || 0)
  );
  const [currentPrice, setCurrentPrice] = useState(0);

  const [token0PriceData, setToken0PriceData] = useState<
    Array<{ timestamp: number; value: number }>
  >([]);
  const [token1PriceData, setToken1PriceData] = useState<
    Array<{ timestamp: number; value: number }>
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [priceDataLoading, setPriceDataLoading] = useState(false);

  const currentPool = useMemo(() => {
    return pools.find(
      (pool) =>
        pool.poolId.toLowerCase() === poolAddress?.toLowerCase() &&
        pool.chain.id === Number(chainId)
    );
  }, [pools, poolAddress, chainId]);

  const chain = useMemo(() => {
    return NETWORKS.find((n) => n.id === Number(chainId));
  }, [chainId]);

  const liquidityConcentration = useMemo(() => {
    if (isFullRange) return 1;
    if (priceRangeMin >= priceRangeMax || currentPrice === 0) return 1;
    const rangeSize = (priceRangeMax - priceRangeMin) / currentPrice;
    return Math.min(1 / rangeSize, 10);
  }, [isFullRange, priceRangeMin, priceRangeMax, currentPrice]);

  const correlationData = useMemo(() => {
    if (!currentPool || token0PriceData.length === 0) return [];

    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Calculer le prix relatif ACTUEL pour la référence
    const currentRelativePrice =
      token0PriceData.length > 0 && token1PriceData.length > 0
        ? token0PriceData[token0PriceData.length - 1].value /
          token1PriceData[token1PriceData.length - 1].value
        : Number(currentPool.token0.priceUSD) /
          Number(currentPool.token1.priceUSD);

    // Mettre à jour currentPrice avec la valeur cohérente
    if (currentPrice !== currentRelativePrice) {
      setCurrentPrice(currentRelativePrice);
    }

    for (let i = 0; i < timeframe; i++) {
      // Utiliser les indices en partant de la fin (données les plus récentes)
      const token0Index = Math.max(0, token0PriceData.length - timeframe + i);
      const token1Index = Math.max(0, token1PriceData.length - timeframe + i);

      const token0Price =
        token0PriceData[token0Index]?.value ||
        token0PriceData[token0PriceData.length - 1]?.value ||
        Number(currentPool.token0.priceUSD);
      const token1Price =
        token1PriceData[token1Index]?.value ||
        token1PriceData[token1PriceData.length - 1]?.value ||
        Number(currentPool.token1.priceUSD);

      // Calculer le prix relatif (token0/token1)
      const relativePrice =
        token1Price > 0 ? token0Price / token1Price : currentRelativePrice;

      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const timestamp = date.getTime();

      const dayIndex = Math.min(i, currentPool.poolDayDatas.length - 1);
      const poolDayData =
        currentPool.poolDayDatas[dayIndex] || currentPool.poolDayDatas[0];
      const dailyVolume =
        Number(poolDayData.volumeUSD) || currentPool.volume24h;

      // Utiliser la nouvelle fonction de calcul des frais
      const feeCalculation = calculateEstimatedFees({
        volume: dailyVolume,
        feeTier: Number(currentPool.feeTier),
        liquidityAmount,
        totalValueLocked: currentPool.totalValueLockedUSD,
        currentPrice: relativePrice,
        priceRangeMin,
        priceRangeMax,
        isFullRange,
      });

      const impermanentLoss = 0;
      const apy = calculateAPY(
        feeCalculation.estimatedFees,
        liquidityAmount,
        1
      );

      data.push({
        timestamp,
        date: date.toLocaleDateString(),
        fees: feeCalculation.estimatedFees,
        impermanentLoss: Math.min(0, -Math.abs(impermanentLoss)),
        netEarnings: feeCalculation.estimatedFees,
        apy: apy * timeframe, // Ajuster pour la période complète
        price0: token0Price,
        price1: token1Price,
        relativePrice,
        volume: dailyVolume,
        tvl: currentPool.totalValueLockedUSD,
        liquidityConcentration: feeCalculation.liquidityConcentration,
        isInRange: feeCalculation.isInRange,
      });
    }
    return data;
  }, [
    currentPool,
    liquidityAmount,
    timeframe,
    token0PriceData,
    token1PriceData,
    currentPrice,
    priceRangeMin,
    priceRangeMax,
    isFullRange,
  ]);

  const totalEarnings = useMemo(() => {
    if (correlationData.length === 0) return 0;
    const actualDays = correlationData.length;
    const totalActualEarnings = correlationData.reduce(
      (sum, data) => sum + data.netEarnings,
      0
    );
    const dailyAverageEarnings = totalActualEarnings / actualDays;
    const monthlyEarnings = dailyAverageEarnings * 30;
    return monthlyEarnings;
  }, [correlationData]);

  const tokensDayDatas = useMemo(() => {
    if (!currentPool || token0PriceData.length === 0 || token1PriceData.length === 0) {
      return [];
    }

    const data: Array<{
      token0Price: string | number;
      token1Price: string | number;
      date: number;
      volumeUSD: string | number;
    }> = [];

    // Prendre la longueur minimale entre les données de prix et les données de pool
    const maxLength = Math.min(
      token0PriceData.length,
      token1PriceData.length,
      currentPool.poolDayDatas.length,
      timeframe
    );

    for (let i = 0; i < maxLength; i++) {
      // Utiliser les indices en partant de la fin pour avoir les données les plus récentes
      const token0Index = Math.max(0, token0PriceData.length - maxLength + i);
      const token1Index = Math.max(0, token1PriceData.length - maxLength + i);
      const poolIndex = Math.max(0, currentPool.poolDayDatas.length - maxLength + i);

      const token0Price = token0PriceData[token0Index]?.value || Number(currentPool.token0.priceUSD);
      const token1Price = token1PriceData[token1Index]?.value || Number(currentPool.token1.priceUSD);
      const poolDayData = currentPool.poolDayDatas[poolIndex];
      const volumeUSD = poolDayData?.volumeUSD || currentPool.volume24h;

      // Calculer la date correspondante
      const date = token0PriceData[token0Index]?.timestamp || Date.now() - (maxLength - i) * 24 * 60 * 60 * 1000;

      data.push({
        token0Price: token0Price.toString(),
        token1Price: token1Price.toString(),
        date: Math.floor(date / 1000), // Convertir en timestamp Unix (secondes)
        volumeUSD: volumeUSD.toString(),
      });
    }

    return data;
  }, [currentPool, token0PriceData, token1PriceData, timeframe]);

  // const avgAPY = useMemo(() => {
  //   const sum = correlationData.reduce((sum, data) => sum + data.apy, 0);
  //   return sum / correlationData.length || 0;
  // }, [correlationData]);

  useEffect(() => {
    if (
      currentPool &&
      currentPool.token0.priceUSD &&
      currentPool.token1.priceUSD
    ) {
      const price =
        Number(currentPool.token0.priceUSD) /
        Number(currentPool.token1.priceUSD);
      setCurrentPrice(price);
      if (token0PriceData.length > 0 && token1PriceData.length > 0) {
        setPriceRangeMin(price * 0.95);
        setPriceRangeMax(price * 1.05);
      }
    }
  }, [currentPool, token0PriceData, token1PriceData]);

  useEffect(() => {
    if (token0PriceData.length > 0 && token1PriceData.length > 0) {
      // Prendre les prix les plus récents des données CoinGecko
      const latestToken0Price =
        token0PriceData[token0PriceData.length - 1]?.value;
      const latestToken1Price =
        token1PriceData[token1PriceData.length - 1]?.value;

      if (latestToken0Price && latestToken1Price) {
        const realCurrentPrice = latestToken0Price / latestToken1Price;
        setCurrentPrice(realCurrentPrice);

        // Mettre à jour le range seulement si ce n'est pas déjà défini par l'utilisateur
        if (priceRangeMin === 0 && priceRangeMax === 0) {
          setPriceRangeMin(realCurrentPrice * 0.95);
          setPriceRangeMax(realCurrentPrice * 1.05);
        }
      }
    }
  }, [token0PriceData, token1PriceData, priceRangeMin, priceRangeMax]);

  useEffect(() => {
    const loadPriceData = async () => {
      if (!currentPool) return;

      setPriceDataLoading(true);
      try {
        // Calculer les dates de début et fin
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(
          endDate.getDate() - Number(QueryPeriodEnum.ONE_MONTH)
        );

        // Charger les données de prix pour les deux tokens
        const [token0Prices, token1Prices] = await Promise.all([
          getPriceChart(
            currentPool.token0.address,
            Number(chainId),
            QueryPeriodEnum.ONE_MONTH
          ),
          getPriceChart(
            currentPool.token1.address,
            Number(chainId),
            QueryPeriodEnum.ONE_MONTH
          ),
        ]);

        setToken0PriceData(token0Prices?.prices || []);
        setToken1PriceData(token1Prices?.prices || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données de prix:", error);
        // Fallback vers les données existantes
        setToken0PriceData([]);
        setToken1PriceData([]);
      } finally {
        setPriceDataLoading(false);
      }
    };

    loadPriceData();
  }, [currentPool, chainId]);

  const addToPortfolio = () => {
    if (!currentPool || !chain) return;

    // Calculer les métriques actuelles
    const dailyEarnings = totalEarnings / 30;
    const estimatedAPR = ((totalEarnings / liquidityAmount) * 12 * 100);

    // Créer l'objet position
    const newPosition = {
      id: `${currentPool.poolId}_${chainId}_${Date.now()}`,
      poolId: currentPool.poolId,
      chainId: Number(chainId),
      token0: {
        symbol: currentPool.token0.symbol,
        logoURI: currentPool.token0.logoURI,
        address: currentPool.token0.address,
        decimals: currentPool.token0.decimals,
        priceUSD: currentPool.token0.priceUSD,
      },
      token1: {
        symbol: currentPool.token1.symbol,
        logoURI: currentPool.token1.logoURI,
        address: currentPool.token1.address,
        decimals: currentPool.token1.decimals,
        priceUSD: currentPool.token1.priceUSD,
      },
      feeTier: Number(currentPool.feeTier),
      liquidityAmount,
      estimatedAPR,
      daily24hProjectionUSD: dailyEarnings,
      chainName: chain.name,
      chainLogoURI: chain.logoURI,
      priceRangeMin: isFullRange ? undefined : priceRangeMin,
      priceRangeMax: isFullRange ? undefined : priceRangeMax,
      isFullRange,
      addedAt: Date.now(),
    };

    // Récupérer les positions existantes
    const existingPositions = JSON.parse(
      localStorage.getItem("lp_portfolio_positions") || "[]"
    );

    // Vérifier si la position existe déjà (même pool, même chaîne, même range)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingIndex = existingPositions.findIndex((pos: any) => 
      pos.poolId === newPosition.poolId && 
      pos.chainId === newPosition.chainId &&
      pos.isFullRange === newPosition.isFullRange &&
      pos.priceRangeMin === newPosition.priceRangeMin &&
      pos.priceRangeMax === newPosition.priceRangeMax
    );

    if (existingIndex !== -1) {
      // Mettre à jour la position existante
      existingPositions[existingIndex] = newPosition;
    } else {
      // Ajouter la nouvelle position
      existingPositions.push(newPosition);
    }

    // Sauvegarder dans localStorage
    localStorage.setItem("lp_portfolio_positions", JSON.stringify(existingPositions));

    // Naviguer vers le portfolio builder
    navigate("/builder");
  };

  if (loading) {
    return (
      <div className="min-h-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-2xl shadow-xl mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // if (!currentPool) {
  //   return (
  //     <div className="min-h-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-2xl shadow-xl mb-8">
  //       <div className="text-center">
  //         <div className="text-6xl mb-4">🔍</div>
  //         <h2 className="text-2xl font-bold text-white mb-2">Pool not found</h2>
  //         <p className="text-gray-400">
  //           The pool you are looking for does not exist or is not available on
  //           this chain.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }
  if (!currentPool || !poolAddress || !chainId) {
    return (<DefaultPreviewPage />)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-2xl shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left block - Title and info */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Calculator className="w-8 h-8 text-white" />
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Estimate Earnings
                    </h1>
                    <div className="hidden sm:flex items-center pt-1">
                      <img
                        src={`${currentPool.token0.logoURI}`}
                        alt={currentPool.token0.symbol}
                        className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-lg bg-white z-10"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${currentPool.token0.symbol[0]}`;
                        }}
                      />
                      <img
                        src={`${currentPool.token1.logoURI}`}
                        alt={currentPool.token1.symbol}
                        className="w-8 h-8 -ml-2 rounded-full border-2 border-pink-400 shadow-lg bg-white"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/40/8b5cf6/ffffff?text=${currentPool.token1.symbol[0]}`;
                        }}
                      />
                      <p className="text-gray-200 ml-2">
                        {currentPool.token0.symbol} /{" "}
                        {currentPool.token1.symbol} • Fee{" "}
                        {(Number(currentPool.feeTier) / 10000).toFixed(2)}% •{" "}
                        {chain?.name || "unknown"} Network
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* mobile only */}
              <div className="flex sm:hidden items-center pt-1">
                <img
                  src={`${currentPool.token0.logoURI}`}
                  alt={currentPool.token0.symbol}
                  className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-lg bg-white z-10"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${currentPool.token0.symbol[0]}`;
                  }}
                />
                <img
                  src={`${currentPool.token1.logoURI}`}
                  alt={currentPool.token1.symbol}
                  className="w-8 h-8 -ml-2 rounded-full border-2 border-pink-400 shadow-lg bg-white"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/40/8b5cf6/ffffff?text=${currentPool.token1.symbol[0]}`;
                  }}
                />
                <p className="text-gray-400 ml-2">
                  {currentPool.token0.symbol} / {currentPool.token1.symbol} •
                  Fee {(Number(currentPool.feeTier) / 10000).toFixed(2)}% •{" "}
                  {chain?.name || "unknown"} Network
                </p>
              </div>

              {/* Right block */}
              <div className="flex flex-row gap-3 lg:flex-shrink-0">
                {/* Add to Portfolio Button */}
                <button
                  onClick={addToPortfolio}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Add to Portfolio</span>
                  <span className="sm:hidden">Add</span>
                </button>

                {/* External Links */}
                <div className="flex gap-3">
                  <a
                    href={`${chain?.blockExplorers?.default.url}/address/${poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <img
                      src={ScanExplorerIcon}
                      alt="Block Explorer"
                      className="w-4 h-4"
                    />
                  </a>

                  <a
                    href={`https://dexscreener.com/${chain?.keyMapper}/${poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <img
                      src={DexScreenerIcon}
                      alt="DexScreener"
                      className="w-4 h-4"
                    />
                  </a>

                  <a
                    href={`https://app.uniswap.org/explore/pools/${chain?.keyMapper}/${poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4 text-pink-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${(totalEarnings / 30).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">
                    24h Estimated Earnings
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {/* <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      ((totalEarnings) / liquidityAmount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div> */}

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <div className="text-lg font-semibold text-purple-300">
                      ${totalEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Monthly
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-300">
                      ${(totalEarnings * 12).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Yearly
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MetricsCard
              icon={TrendingUp}
              title="Average APY"
              value={`${((totalEarnings / liquidityAmount) * 12 * 100).toFixed(
                2
              )}%`}
              color="text-purple-500"
              subtitle={`Annualized return on $${liquidityAmount.toLocaleString()} liquidity`}
            />
            <MetricsCard
              icon={Settings}
              title="Liquidity Amount"
              value={`$${liquidityAmount.toLocaleString()}`}
              color="text-blue-500"
              subtitle={`${(
                (liquidityAmount / currentPool.totalValueLockedUSD) *
                100
              ).toFixed(3)}% of pool TVL ($${(
                currentPool.totalValueLockedUSD / 1000000
              ).toFixed(1)}M)`}
            />
            <MetricsCard
              icon={Clock}
              title="Timeframe"
              value={`${timeframe}d`}
              color="text-pink-500"
              subtitle="Historical data analysis period"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1">
          <SimulationControlsPanel
            liquidityAmount={liquidityAmount}
            setLiquidityAmount={setLiquidityAmount}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            isFullRange={isFullRange}
            setIsFullRange={setIsFullRange}
            currentPrice={currentPrice}
            priceRangeMin={priceRangeMin}
            setPriceRangeMin={setPriceRangeMin}
            priceRangeMax={priceRangeMax}
            setPriceRangeMax={setPriceRangeMax}
            liquidityConcentration={liquidityConcentration}
            currentPool={currentPool}
            tokensDayDatas={tokensDayDatas}
          />
        </div>

        {/* Chart Panel */}
        <div className="xl:col-span-2">
          <ChartPanel
            correlationData={correlationData}
            currentPrice={currentPrice}
            priceRangeMin={priceRangeMin}
            priceRangeMax={priceRangeMax}
            isFullRange={isFullRange}
            token0={currentPool.token0}
            token1={currentPool.token1}
          />

          {/* Volume Chart */}
          <VolumeChart poolDayDatas={currentPool.poolDayDatas} />
        </div>
      </div>
    </div>
  );
};


const DefaultPreviewPage = () => {
    const navigate = useNavigate();
      return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-2xl shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Estimate Earnings
                  </h1>
                  <p className="text-gray-200 mt-1">
                    Calculate potential returns for liquidity providing positions
                  </p>
                </div>
              </div>
            </div>

            {/* Empty State Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-500">
                      $--
                    </div>
                    <div className="text-sm text-gray-400">
                      24h Estimated Earnings
                    </div>
                  </div>
                </div>
              </div>

              <MetricsCard
                icon={TrendingUp}
                title="Average APY"
                value="--"
                color="text-gray-400"
                subtitle="Select a pool to see estimates"
              />
              
              <MetricsCard
                icon={Settings}
                title="Liquidity Amount"
                value="--"
                color="text-gray-400"
                subtitle="Configure your position size"
              />
              
              <MetricsCard
                icon={Clock}
                title="Timeframe"
                value="--"
                color="text-gray-400"
                subtitle="Historical analysis period"
              />
            </div>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              {/* Icon */}
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl">
                    <Calculator className="w-16 h-16 text-purple-600" />
                  </div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </motion.div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Calculate Your LP Returns?
              </h2>
              
              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Get detailed earnings estimates for any Uniswap V3 liquidity position. 
                Analyze historical performance, optimize your price ranges, and make informed investment decisions.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="text-left p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">APY Calculation</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Calculate realistic returns based on historical volume and fee data
                  </p>
                </div>

                <div className="text-left p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Settings className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Range Optimization</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Test different price ranges and see their impact on your earnings
                  </p>
                </div>

                <div className="text-left p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Historical Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Analyze performance over different time periods and market conditions
                  </p>
                </div>

                <div className="text-left p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Fee Projections</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get detailed breakdowns of fee earnings and portfolio impact
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/explore')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
                >
                  <Search className="w-5 h-5" />
                  <span>Explore Pools</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('/builder')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 font-medium text-lg"
                >
                  <span>View Portfolio Builder</span>
                </button>
              </div>

              {/* Bottom hint */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 <strong>Pro tip:</strong> Start by exploring high-volume pools for more stable earnings estimates
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
}