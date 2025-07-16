import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePools } from "../hooks/usePools";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Settings,
  Clock,
  Calculator,
} from "lucide-react";
import { getPriceChart, QueryPeriodEnum } from "../services/coingecko";
import { SimulationControlsPanel } from "../components/SimulationControlsSimulationControlsPanel";
import { ChartPanel } from "../components/ChartPanel";
import { MetricsCard } from "../components/MetricsCard";
import { VolumeChart } from "../components/positions/VolumeChart";

export const EstimateEarningsPage = () => {
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId");
  const poolAddress = searchParams.get("poolAddress");

  const { pools, loading } = usePools();
  const [liquidityAmount, setLiquidityAmount] = useState(
    Number(searchParams.get("liquidityAmount") || 1_000)
  );
  const [timeframe, setTimeframe] = useState(30);

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
      setPriceRangeMin(price * 0.95);
      setPriceRangeMax(price * 1.05);
    }
  }, [currentPool]);

  useEffect(() => {
    const loadPriceData = async () => {
      if (!currentPool) return;

      setPriceDataLoading(true);
      try {
        // Calculer les dates de début et fin
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - Number(QueryPeriodEnum.ONE_MONTH));

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

  const liquidityConcentration = useMemo(() => {
    if (isFullRange) return 1;
    if (priceRangeMin >= priceRangeMax || currentPrice === 0) return 1;
    const rangeSize = (priceRangeMax - priceRangeMin) / currentPrice;
    return Math.min(1 / rangeSize, 10);
  }, [isFullRange, priceRangeMin, priceRangeMax, currentPrice]);

  const correlationData = useMemo(() => {
    if (!currentPool || token0PriceData.length === 0) return [];

    // Créer un map des prix par timestamp pour faciliter la recherche
    const token0PriceMap = new Map(
      token0PriceData.map((p) => [p.timestamp, p.value])
    );
    const token1PriceMap = new Map(
      token1PriceData.map((p) => [p.timestamp, p.value])
    );

    return Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - i));
      const timestamp = date.getTime();

      // Trouver le prix le plus proche dans le temps
      const findClosestPrice = (
        priceMap: Map<number, number>,
        targetTimestamp: number
      ) => {
        let closestTimestamp = 0;
        let minDiff = Infinity;

        for (const ts of priceMap.keys()) {
          const diff = Math.abs(ts - targetTimestamp);
          if (diff < minDiff) {
            minDiff = diff;
            closestTimestamp = ts;
          }
        }

        return priceMap.get(closestTimestamp) || 0;
      };

      const token0Price =
        findClosestPrice(token0PriceMap, timestamp) ||
        Number(currentPool.token0.priceUSD);
      const token1Price =
        findClosestPrice(token1PriceMap, timestamp) ||
        Number(currentPool.token1.priceUSD);

      // Calculer le prix relatif (token0/token1)
      const relativePrice =
        token1Price > 0 ? token0Price / token1Price : currentPrice;

      // Utiliser les données historiques réelles du pool pour le volume
      const dayIndex = Math.min(i, currentPool.poolDayDatas.length - 1);
      const poolDayData =
        currentPool.poolDayDatas[dayIndex] || currentPool.poolDayDatas[0];
      const dailyVolume =
        Number(poolDayData.volumeUSD) || currentPool.volume24h;

      // Calcul des frais basé sur les vraies données
      const feeTierPercentage = Number(currentPool.feeTier) / 1000000;
      const baseFees = dailyVolume * feeTierPercentage;
      const liquidityShare = liquidityAmount / currentPool.totalValueLockedUSD;

      // Vérifier si le prix est dans la range (seulement si pas full range)
      const isInRange =
        isFullRange ||
        (relativePrice >= priceRangeMin && relativePrice <= priceRangeMax);
      const estimatedFees =
        baseFees * liquidityShare * (isInRange ? liquidityConcentration : 0);

      // Calcul de l'impermanent loss basé sur les prix réels
      const priceRatio = relativePrice / currentPrice;
      const impermanentLoss = isFullRange
        ? liquidityAmount * ((2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1)
        : (Math.abs(relativePrice - currentPrice) / currentPrice) *
          liquidityAmount *
          0.1;

      return {
        timestamp,
        date: date.toLocaleDateString(),
        fees: estimatedFees,
        impermanentLoss: Math.min(0, -Math.abs(impermanentLoss)), // IL est toujours négatif
        netEarnings: estimatedFees + Math.min(0, -Math.abs(impermanentLoss)),
        apy:
          ((estimatedFees + Math.min(0, -Math.abs(impermanentLoss))) /
            liquidityAmount) *
          (365 / timeframe) *
          100,
        price0: token0Price,
        price1: token1Price,
        relativePrice,
        volume: dailyVolume,
        tvl: currentPool.totalValueLockedUSD,
      };
    });
  }, [
    currentPool,
    liquidityAmount,
    timeframe,
    liquidityConcentration,
    token0PriceData,
    token1PriceData,
    currentPrice,
    priceRangeMin,
    priceRangeMax,
    isFullRange,
  ]);

  const totalEarnings = useMemo(() => {
    return correlationData.reduce((sum, data) => sum + data.netEarnings, 0);
  }, [correlationData]);

  const avgAPY = useMemo(() => {
    const sum = correlationData.reduce((sum, data) => sum + data.apy, 0);
    return sum / correlationData.length || 0;
  }, [correlationData]);

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

  if (!currentPool) {
    return (
      <div className="min-h-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-2xl shadow-xl mb-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pool not found</h2>
          <p className="text-gray-400">
            The pool you are looking for does not exist or is not available on
            this chain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-2xl shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Estimate Earnings
                </h1>
                <p className="text-gray-400">
                  {currentPool.token0.symbol} / {currentPool.token1.symbol} •
                  Fee {(Number(currentPool.feeTier) / 10000).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricsCard
              icon={DollarSign}
              title="Total Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              color="text-green-500"
              progress={{
                value: (totalEarnings / liquidityAmount) * 100,
                gradient: "from-green-500 to-emerald-500",
              }}
            />
            <MetricsCard
              icon={TrendingUp}
              title="Average APY"
              value={`${avgAPY.toFixed(2)}%`}
              color="text-purple-500"
              subtitle={`$${((avgAPY / 100) * liquidityAmount).toFixed(
                2
              )} estimated earnings in ${timeframe} days`}
            />
            <MetricsCard
              icon={Settings}
              title="Liquidity Amount"
              value={`$${liquidityAmount.toLocaleString()}`}
              color="text-blue-500"
              subtitle="Simulated liquidity amount"
            />
            <MetricsCard
              icon={Clock}
              title="Timeframe"
              value={`${timeframe}d`}
              color="text-orange-500"
              subtitle="Simulation timeframe"
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
          <VolumeChart
            poolDayDatas={currentPool.poolDayDatas}
          />
        </div>
      </div>
    </div>
  );
};
