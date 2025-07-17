import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  X,
  Plus,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import { TokenSymbolsGroup } from "../components/TokenSymbolsGroup";
import { MetricsCard } from "../components/MetricsCard";
import { useNavigate } from "react-router-dom";
import { PORTFOLIO_STORAGE_KEY, PortfolioPosition } from "../types";
import { PortfolioYieldChart } from "../components/PortfolioYieldChart";

export const LPPortfolioBuilderPage: React.FC = () => {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const navigate = useNavigate();

  // Charger les positions depuis le localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (savedPositions) {
      try {
        const parsedPositions = JSON.parse(savedPositions);
        setPositions(parsedPositions);
      } catch (error) {
        console.error("Erreur lors du chargement du portfolio:", error);
      }
    }
  }, []);

  // Calculer le montant total investi
  useEffect(() => {
    const total = positions.reduce((sum, position) => sum + position.liquidityAmount, 0);
    setTotalInvestment(total);
  }, [positions]);

  // Sauvegarder les positions dans le localStorage
  const savePositions = (newPositions: PortfolioPosition[]) => {
    setPositions(newPositions);
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(newPositions));
  };

  // Supprimer une position
  const removePosition = (positionId: string) => {
    const newPositions = positions.filter(pos => pos.id !== positionId);
    savePositions(newPositions);
  };

  const navigateToEstimate = (position: PortfolioPosition) => {
    const searchParams = new URLSearchParams({
      chainId: position.chainId.toString(),
      poolAddress: position.poolId,
      liquidityAmount: position.liquidityAmount.toString(),
    });

    // Ajouter les paramètres de range si ce n'est pas full range
    if (!position.isFullRange && position.priceRangeMin && position.priceRangeMax) {
      searchParams.set('minPrice', position.priceRangeMin.toString());
      searchParams.set('maxPrice', position.priceRangeMax.toString());
    }

    navigate(`/estimate?${searchParams.toString()}`);
  };

  // Métriques calculées
  const portfolioMetrics = useMemo(() => {
    if (positions.length === 0) {
      return {
        totalDailyEarnings: 0,
        averageAPR: 0,
        totalMonthlyEarnings: 0,
        totalYearlyEarnings: 0,
      };
    }

    const totalDailyEarnings = positions.reduce((sum, pos) => sum + pos.daily24hProjectionUSD, 0);
    const weightedAPR = positions.reduce((sum, pos) => {
      const weight = pos.liquidityAmount / totalInvestment;
      return sum + (pos.estimatedAPR * weight);
    }, 0);

    return {
      totalDailyEarnings,
      averageAPR: weightedAPR,
      totalMonthlyEarnings: totalDailyEarnings * 30,
      totalYearlyEarnings: totalDailyEarnings * 365,
    };
  }, [positions, totalInvestment]);

  const yieldChartData = useMemo(() => {
    if (positions.length === 0) {
      return {
        totalDailyEarnings: 0,
        totalMonthlyEarnings: 0,
        totalYearlyEarnings: 0,
        averageAPR: 0,
        positions: [],
      };
    }

    const chartPositions = positions.map((position) => ({
      id: position.id,
      symbol: `${position.token0.symbol}/${position.token1.symbol}`,
      apr: position.estimatedAPR,
      dailyEarnings: position.daily24hProjectionUSD,
      liquidityAmount: position.liquidityAmount,
      allocation: (position.liquidityAmount / totalInvestment) * 100,
      chainName: position.chainName,
      feeTier: position.feeTier,
    }));

    return {
      totalDailyEarnings: portfolioMetrics.totalDailyEarnings,
      totalMonthlyEarnings: portfolioMetrics.totalMonthlyEarnings,
      totalYearlyEarnings: portfolioMetrics.totalYearlyEarnings,
      averageAPR: portfolioMetrics.averageAPR,
      positions: chartPositions,
    };
  }, [positions, totalInvestment, portfolioMetrics]);


  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-cyan-800 to-purple-900 p-6 rounded-2xl shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                LP Portfolio Builder
              </h1>
              <p className="text-gray-200 mt-1">
                Build and analyze your liquidity provider portfolio across multiple pools
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${portfolioMetrics.totalDailyEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  Daily Earnings
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <div className="text-lg font-semibold text-emerald-300">
                    ${portfolioMetrics.totalMonthlyEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Monthly
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-emerald-300">
                    ${portfolioMetrics.totalYearlyEarnings.toFixed(2)}
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
            title="Average APR"
            value={`${portfolioMetrics.averageAPR.toFixed(2)}%`}
            color="text-emerald-400"
            subtitle="Weighted by investment amount"
          />
          
          <MetricsCard
            icon={Target}
            title="Total Investment"
            value={formatLargeNumber(totalInvestment)}
            color="text-teal-400"
            subtitle={`Across ${positions.length} position${positions.length !== 1 ? 's' : ''}`}
          />
          
          <MetricsCard
            icon={BarChart3}
            title="Diversification"
            value={`${positions.length}`}
            color="text-cyan-400"
            subtitle="Active LP positions"
          />
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Portfolio Positions</h3>
              <p className="text-gray-600 text-sm">
                Manage your LP positions and track performance
              </p>
            </div>

            <div className="p-6">
              {/* Total Investment Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Investment</span>
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatLargeNumber(totalInvestment)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Across {positions.length} position{positions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Add Position Button */}
              <button
                onClick={() => navigate('/explore')}
                className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-700 via-cyan-800 to-purple-900 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Position</span>
              </button>

              {/* Positions List */}
              {/* <div className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No positions in your portfolio yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start by exploring pools and adding positions
                    </p>
                  </div>
                ) : (
                  positions.map((position) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <TokenSymbolsGroup tokens={{
                            token0: position.token0,
                            token1: position.token1
                          }} />
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {position.token0.symbol}/{position.token1.symbol}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {(position.feeTier / 10000).toFixed(2)}%
                              </span>
                              <div className="flex items-center gap-1">
                                <img
                                  src={position.chainLogoURI}
                                  alt={position.chainName}
                                  className="w-3 h-3 rounded-full"
                                />
                                <span>{position.chainName}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removePosition(position.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Liquidity:</span>
                          <div className="font-semibold text-gray-800">
                            {formatLargeNumber(position.liquidityAmount)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">APR:</span>
                          <div className="font-semibold text-green-600">
                            {position.estimatedAPR.toFixed(2)}%
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">24h Projection:</span>
                          <div className="font-semibold text-blue-600">
                            ${position.daily24hProjectionUSD.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Added {new Date(position.addedAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div> */}
              <div className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No positions in your portfolio yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start by exploring pools and adding positions
                    </p>
                  </div>
                ) : (
                  positions.map((position) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Header clickable area */}
                      <div 
                        onClick={() => navigateToEstimate(position)}
                        className="cursor-pointer p-4 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <TokenSymbolsGroup tokens={{
                              token0: position.token0,
                              token1: position.token1
                            }} />
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800 truncate">
                                  {position.token0.symbol}/{position.token1.symbol}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                  {(position.feeTier / 10000).toFixed(2)}%
                                </span>
                                <div className="flex items-center gap-1">
                                  <img
                                    src={position.chainLogoURI}
                                    alt={position.chainName}
                                    className="w-3 h-3 rounded-full"
                                  />
                                  <span className="text-gray-600">{position.chainName}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Empêcher la navigation
                              removePosition(position.id);
                            }}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white/70 rounded-lg p-2">
                            <span className="text-gray-500 text-xs">Liquidity</span>
                            <div className="font-bold text-gray-800">
                              {formatLargeNumber(position.liquidityAmount)}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-2">
                            <span className="text-gray-500 text-xs">APR</span>
                            <div className="font-bold text-emerald-600">
                              {position.estimatedAPR.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 bg-white/70 rounded-lg p-2">
                          <span className="text-gray-500 text-xs">24h Projection</span>
                          <div className="font-bold text-teal-600">
                            ${position.daily24hProjectionUSD.toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Added {new Date(position.addedAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Click to view details →
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              {positions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No data to display</h4>
                  <p className="text-sm">
                    Add positions to your portfolio to see analytics and charts
                  </p>
                </div>
              ) : (
                <PortfolioYieldChart data={yieldChartData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};