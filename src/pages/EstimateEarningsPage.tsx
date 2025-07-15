import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import CorrelationChart from "../components/CorrelationChart";

export const EstimateEarningsPage = () => {
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId");
  const poolAddress = searchParams.get("poolAddress");

  const { pools, loading } = usePools();
  const [liquidityAmount, setLiquidityAmount] = useState(10000);
  const [timeframe, setTimeframe] = useState(30); // days
  const [feeMultiplier] = useState(1);

  const currentPool = useMemo(() => {
    return pools.find(
      (pool) =>
        pool.poolId.toLowerCase() === poolAddress?.toLowerCase() &&
        pool.chain.id === Number(chainId)
    );
  }, [pools, poolAddress, chainId]);

  // Données simulées pour la corrélation - format adapté au CorrelationChart
  const correlationData = useMemo(() => {
    if (!currentPool) return [];

    const baseData = Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - i));

      const variance = Math.sin(i * 0.2) * 0.1 + Math.random() * 0.05;
      const fees =
        (Number(currentPool.feeTier) || 0.003) *
        liquidityAmount *
        (1 + variance) *
        feeMultiplier;
      const impermanentLoss = Math.abs(variance) * liquidityAmount * 0.02;

      return {
        timestamp: date.getTime(),
        date: date.toLocaleDateString(),
        fees: fees,
        impermanentLoss: -impermanentLoss,
        netEarnings: fees - impermanentLoss,
        apy:
          ((fees - impermanentLoss) / liquidityAmount) *
          (365 / timeframe) *
          100,
        // Données supplémentaires pour le CorrelationChart
        price0: Math.random() * 100 + 50,
        price1: Math.random() * 100 + 50,
        volume: Math.random() * 100000 + 50000,
        tvl: currentPool.totalValueLockedUSD || 0,
      };
    });

    return baseData;
  }, [currentPool, liquidityAmount, timeframe, feeMultiplier]);

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
          <h2 className="text-2xl font-bold text-white mb-2">
            Pool not found
          </h2>
          <p className="text-gray-400">
            The pool you are looking for does not exist or is not available on
            this chain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-2xl shadow-xl mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Estimate Earnings
                </h1>
                <p className="text-gray-400">
                  {currentPool.token0.symbol} / {currentPool.token1.symbol} • Fee{" "}
                  {(Number(currentPool.feeTier) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Total Earnings
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      (totalEarnings / liquidityAmount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {avgAPY.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Average APY
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">
                  {((avgAPY / 100) * liquidityAmount).toFixed(2)}{" "}
                  estimated earnings in {timeframe} days
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Settings className="w-8 h-8 text-blue-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${liquidityAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    Liquidity Amount
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Simulated liquidity amount
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Info className="w-8 h-8 text-orange-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {timeframe}j
                  </div>
                  <div className="text-sm text-gray-400">
                    Timeframe
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Simulation period in days
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Simulation Controls
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Liquidity Amount (USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="10000"
                  />
                  <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Timeframe (days)
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    Pool Information
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>
                    TVL: $
                    {currentPool.totalValueLockedUSD?.toLocaleString() || "N/A"}
                  </div>
                  <div>
                    Volume 24h: $
                    {currentPool.volume24h?.toLocaleString() || "N/A"}
                  </div>
                  <div>
                    Fees:{" "}
                    {((Number(currentPool.feeTier) || 0) * 100).toFixed(3)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation Chart Panel */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Correlation Chart
              </h3>
            </div>

            <CorrelationChart
              state={{
                token0PriceChart: {
                  prices: [
                    {
                      timestamp: new Date("2023-01-01").getTime(),
                      value: 10,
                    },
                    {
                      timestamp: new Date("2023-01-02").getTime(),
                      value: 6,
                    },
                    {
                      timestamp: new Date("2023-01-03").getTime(),
                      value: 4,
                    },
                  ],
                },
                token1PriceChart: {
                  prices: [
                    {
                      timestamp: new Date("2023-01-01").getTime(),
                      value: 20,
                    },
                    {
                      timestamp: new Date("2023-01-02").getTime(),
                      value: 21,
                    },
                    {
                      timestamp: new Date("2023-01-03").getTime(),
                      value: 22,
                    },
                  ],
                },

                priceAssumptionValue: 3.5,
                priceRangeValue: [2.5, 5],
                isFullRange: false,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
