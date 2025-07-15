import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePools } from "../hooks/usePools";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Info,
  Zap,
  Target,
  Clock,
  Calculator,
} from "lucide-react";
import CorrelationChart from "../components/CorrelationChart";
import { PoolColumnDataType } from "../types";
import { getPriceChart, QueryPeriodEnum } from "../services/coingecko";

// Composant pour les métriques principales
const MetricsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  progress,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  progress?: {
    value: number;
    gradient: string;
  };
  color?: string;
}) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-8 h-8 ${color}`} />
      <div className="text-right">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${progress.gradient} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(progress.value, 100)}%` }}
        />
      </div>
    )}
    {subtitle && (
      <div className="flex items-center gap-2 mt-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-gray-300">{subtitle}</span>
      </div>
    )}
  </div>
);

// Composant pour le sélecteur de range de prix
const PriceRangeSelector = ({
  isFullRange,
  setIsFullRange,
  currentPrice,
  priceRangeMin,
  setPriceRangeMin,
  priceRangeMax,
  setPriceRangeMax,
  liquidityConcentration,
  currentPool,
}: {
  isFullRange: boolean;
  setIsFullRange: (value: boolean) => void;
  currentPrice: number;
  priceRangeMin: number;
  setPriceRangeMin: (value: number) => void;
  priceRangeMax: number;
  setPriceRangeMax: (value: number) => void;
  liquidityConcentration: number;
  currentPool: PoolColumnDataType; // Replace with actual type if available
}) => (
  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-500" />
        Price Range
      </h4>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="fullRange"
          checked={isFullRange}
          onChange={(e) => setIsFullRange(e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
        />
        <label
          htmlFor="fullRange"
          className="text-sm font-medium text-gray-700"
        >
          Full Range
        </label>
      </div>
    </div>

    {!isFullRange && (
      <div className="space-y-4">
        <div className="text-center mb-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-800">
            {currentPrice.toFixed(4)}
          </div>
          <div className="text-sm font-medium text-gray-600">
            Current Price ({currentPool?.token0.symbol}/
            {currentPool?.token1.symbol})
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={priceRangeMin}
              onChange={(e) => setPriceRangeMin(Number(e.target.value))}
              step="0.0001"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={priceRangeMax}
              onChange={(e) => setPriceRangeMax(Number(e.target.value))}
              step="0.0001"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Liquidity Concentration:
            </span>
            <span className="text-xl font-bold text-purple-600">
              {liquidityConcentration.toFixed(2)}x
            </span>
          </div>
          <div className="text-xs font-medium text-gray-600 mt-1">
            Higher concentration = More fees (when price is in range)
          </div>
        </div>

        <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Price Range</span>
            <span className="text-gray-800 font-semibold">
              {priceRangeMin.toFixed(4)} - {priceRangeMax.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Range Size</span>
            <span className="text-gray-800 font-semibold">
              {(((priceRangeMax - priceRangeMin) / currentPrice) * 100).toFixed(
                1
              )}
              %
            </span>
          </div>
        </div>
      </div>
    )}

    {isFullRange && (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-700 mb-2">
            Full Range Position
          </div>
          <div className="text-sm font-medium text-green-600">
            Your liquidity will be active at all price levels
          </div>
          <div className="text-xs font-medium text-gray-600 mt-1">
            Lower fees but no impermanent loss risk
          </div>
        </div>
      </div>
    )}
  </div>
);

// Composant pour les informations du pool
const PoolInformation = ({
  currentPool,
}: {
  currentPool: PoolColumnDataType; // Replace with actual type if available
}) => (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Info className="w-5 h-5 text-purple-500" />
      <span className="text-sm font-bold text-purple-700">
        Pool Information
      </span>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">TVL:</span>
        <span className="font-bold text-gray-800">
          ${currentPool?.totalValueLockedUSD?.toLocaleString() || "N/A"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">Volume 24h:</span>
        <span className="font-bold text-gray-800">
          ${currentPool?.volume24h?.toLocaleString() || "N/A"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">Fees:</span>
        <span className="font-bold text-gray-800">
          {((Number(currentPool?.feeTier) || 0) * 100).toFixed(3)}%
        </span>
      </div>
    </div>
  </div>
);

// Composant pour les contrôles de simulation
const SimulationControls = ({
  liquidityAmount,
  setLiquidityAmount,
  timeframe,
  setTimeframe,
  isFullRange,
  setIsFullRange,
  currentPrice,
  priceRangeMin,
  setPriceRangeMin,
  priceRangeMax,
  setPriceRangeMax,
  liquidityConcentration,
  currentPool,
}: {
  liquidityAmount: number;
  setLiquidityAmount: (value: number) => void;
  timeframe: number;
  setTimeframe: (value: number) => void;
  isFullRange: boolean;
  setIsFullRange: (value: boolean) => void;
  currentPrice: number;
  priceRangeMin: number;
  setPriceRangeMin: (value: number) => void;
  priceRangeMax: number;
  setPriceRangeMax: (value: number) => void;
  liquidityConcentration: number;
  currentPool: PoolColumnDataType; // Replace with actual type if available
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <Settings className="w-6 h-6 text-purple-500" />
      Simulation Controls
    </h3>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Liquidity Amount (USD)
        </label>
        <div className="relative">
          <input
            type="number"
            value={liquidityAmount}
            onChange={(e) => setLiquidityAmount(Number(e.target.value))}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            placeholder="10000"
          />
          <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Timeframe
        </label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
        >
          <option value={7}>1 day</option>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      <PriceRangeSelector
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

      <PoolInformation currentPool={currentPool} />
    </div>
  </div>
);

// Composant pour le panneau de graphique
const ChartPanel = ({
  correlationData,
  currentPrice,
  priceRangeMin,
  priceRangeMax,
  isFullRange,
}: {
  correlationData: Array<{
    timestamp: number;
    date: string;
    fees: number;
    impermanentLoss: number;
    netEarnings: number;
    apy: number;
    price0: number;
    price1: number;
    volume: number;
    tvl: number;
  }>;
  currentPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  isFullRange: boolean;
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-500" />
        Earnings Analysis
      </h3>
    </div>

    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <CorrelationChart
        state={{
          token0PriceChart: {
            prices: correlationData.map((data) => ({
              timestamp: data.timestamp,
              value: data.price0,
            })),
          },
          token1PriceChart: {
            prices: correlationData.map((data) => ({
              timestamp: data.timestamp,
              value: data.price1,
            })),
          },
          priceAssumptionValue: currentPrice,
          priceRangeValue: [priceRangeMin, priceRangeMax],
          isFullRange: isFullRange,
        }}
      />
    </div>

    {/* Métriques supplémentaires */}
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-600 mb-1">Total Fees</div>
        <div className="text-xl font-bold text-green-600">
          $
          {correlationData.reduce((sum, data) => sum + data.fees, 0).toFixed(2)}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-600 mb-1">
          Impermanent Loss
        </div>
        <div className="text-xl font-bold text-red-500">
          $
          {Math.abs(
            correlationData.reduce((sum, data) => sum + data.impermanentLoss, 0)
          ).toFixed(2)}
        </div>
      </div>
    </div>
  </div>
);

// Composant principal
export const EstimateEarningsPage = () => {
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId");
  const poolAddress = searchParams.get("poolAddress");

  const { pools, loading } = usePools();
  const [liquidityAmount, setLiquidityAmount] = useState(Number(searchParams.get('liquidityAmount') || 1_000));
  const [timeframe, setTimeframe] = useState(1);

  const [isFullRange, setIsFullRange] = useState(false);
  const [priceRangeMin, setPriceRangeMin] = useState(Number(searchParams.get('minPrice') || 0));
  const [priceRangeMax, setPriceRangeMax] = useState(Number(searchParams.get('maxPrice') || 0));
  const [currentPrice, setCurrentPrice] = useState(0);
  
  const [token0PriceData, setToken0PriceData] = useState<Array<{ timestamp: number; value: number }>>([]);
  const [token1PriceData, setToken1PriceData] = useState<Array<{ timestamp: number; value: number }>>([]);
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
        startDate.setDate(endDate.getDate() - timeframe);

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
          )
        ]);

        setToken0PriceData(token0Prices?.prices || []);
        setToken1PriceData(token1Prices?.prices || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données de prix:', error);
        // Fallback vers les données existantes
        setToken0PriceData([]);
        setToken1PriceData([]);
      } finally {
        setPriceDataLoading(false);
      }
    };

    loadPriceData();
  }, [currentPool, timeframe, chainId]);

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
      token0PriceData.map(p => [p.timestamp, p.value])
    );
    const token1PriceMap = new Map(
      token1PriceData.map(p => [p.timestamp, p.value])
    );

    return Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - i));
      const timestamp = date.getTime();

      // Trouver le prix le plus proche dans le temps
      const findClosestPrice = (priceMap: Map<number, number>, targetTimestamp: number) => {
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

      const token0Price = findClosestPrice(token0PriceMap, timestamp) || Number(currentPool.token0.priceUSD);
      const token1Price = findClosestPrice(token1PriceMap, timestamp) || Number(currentPool.token1.priceUSD);
      
      // Calculer le prix relatif (token0/token1)
      const relativePrice = token1Price > 0 ? token0Price / token1Price : currentPrice;

      // Utiliser les données historiques réelles du pool pour le volume
      const dayIndex = Math.min(i, currentPool.poolDayDatas.length - 1);
      const poolDayData = currentPool.poolDayDatas[dayIndex] || currentPool.poolDayDatas[0];
      const dailyVolume = Number(poolDayData.volumeUSD) || currentPool.volume24h;

      // Calcul des frais basé sur les vraies données
      const feeTierPercentage = Number(currentPool.feeTier) / 1000000;
      const baseFees = dailyVolume * feeTierPercentage;
      const liquidityShare = liquidityAmount / currentPool.totalValueLockedUSD;
      
      // Vérifier si le prix est dans la range (seulement si pas full range)
      const isInRange = isFullRange || (relativePrice >= priceRangeMin && relativePrice <= priceRangeMax);
      const estimatedFees = baseFees * liquidityShare * (isInRange ? liquidityConcentration : 0);

      // Calcul de l'impermanent loss basé sur les prix réels
      const priceRatio = relativePrice / currentPrice;
      const impermanentLoss = isFullRange ? 
        liquidityAmount * (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) :
        (Math.abs(relativePrice - currentPrice) / currentPrice) * liquidityAmount * 0.1;

      return {
        timestamp,
        date: date.toLocaleDateString(),
        fees: estimatedFees,
        impermanentLoss: Math.min(0, -Math.abs(impermanentLoss)), // IL est toujours négatif
        netEarnings: estimatedFees + Math.min(0, -Math.abs(impermanentLoss)),
        apy: ((estimatedFees + Math.min(0, -Math.abs(impermanentLoss))) / liquidityAmount) * (365 / timeframe) * 100,
        price0: token0Price,
        price1: token1Price,
        relativePrice,
        volume: dailyVolume,
        tvl: currentPool.totalValueLockedUSD,
      };
    });
  }, [currentPool, liquidityAmount, timeframe, liquidityConcentration, token0PriceData, token1PriceData, currentPrice, priceRangeMin, priceRangeMax, isFullRange]);

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
                  Fee {(Number(currentPool.feeTier) * 100).toFixed(2)}%
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
          <SimulationControls
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
          />
        </div>
      </div>
    </div>
  );
};
