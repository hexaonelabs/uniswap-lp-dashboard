import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePositions } from "../hooks/usePositions";
import { Position, PositionsFilterOptions, TimeFilter } from "../types";
import { validateAndResolveAddress } from "../data/data";
import { PositionsHeader } from "../components/positions/PositionsHeader";
import { PositionCard } from "../components/positions/PositionCard";
import { PositionsFilters } from "../components/positions/PositionsFilters";
import { NETWORKS } from "../services/fetcher";
import {
  PortfolioYieldChart,
  YieldChartData,
} from "../components/PortfolioYieldChart";
import { TrendingUp } from "lucide-react";

const getTimeFilteredPositions = (
  positions: Position[],
  timeFilter: TimeFilter
) => {
  if (timeFilter === "all") return positions;

  const now = new Date();
  const timeMap = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };

  const cutoffTime = now.getTime() - timeMap[timeFilter];

  return positions.filter((position) => {
    const positionDate = new Date(position.createdAt).getTime();
    return positionDate >= cutoffTime;
  });
};

const convertPositionsToPortfolioData = (
  positions: Position[]
): YieldChartData => {
  if (positions.length === 0) {
    return {
      totalDailyEarnings: 0,
      totalMonthlyEarnings: 0,
      totalYearlyEarnings: 0,
      averageAPR: 0,
      positions: [],
    };
  }

  // Calculer le total de la valeur du portfolio
  const totalValue = positions.reduce((sum, pos) => sum + pos.totalValueUSD, 0);

  // Calculer les gains quotidiens estimés basés sur l'APR et la valeur
  const totalDailyEarnings = positions.reduce((sum, pos) => {
    const dailyAPR = pos.apr / 365 / 100; // Convertir APR annuel en taux quotidien
    return sum + pos.totalValueUSD * dailyAPR;
  }, 0);

  // Calculer l'APR moyen pondéré par la valeur
  const weightedAPR = positions.reduce((sum, pos) => {
    const weight = pos.totalValueUSD / totalValue;
    return sum + pos.apr * weight;
  }, 0);

  // Convertir les positions pour le graphique
  const chartPositions = positions.map((position) => {
    const dailyEarnings = position.feesEarnedUSD;

    return {
      id: position.id,
      symbol: `${position.token0.symbol}/${position.token1.symbol}`,
      apr: position.apr,
      dailyEarnings: dailyEarnings,
      liquidityAmount: position.totalValueUSD,
      allocation: (position.totalValueUSD / totalValue) * 100,
      chainName: position.chain.name,
      feeTier: position.feeTier,
    };
  });

  return {
    totalDailyEarnings,
    totalMonthlyEarnings: totalDailyEarnings * 30,
    totalYearlyEarnings: totalDailyEarnings * 365,
    averageAPR: weightedAPR,
    positions: chartPositions,
  };
};

export const PositionsDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const addressToValidate = searchParams.get("address");
  const [evmAddress, setEvmAddress] = useState<string | undefined>(undefined);
  const { positions, loading, error } = usePositions(evmAddress || undefined);

  const [filters, setFilters] = useState<PositionsFilterOptions>({
    status: "open",
    range: "all",
    chain: "all",
    sortBy: "created",
    sortOrder: "desc",
  });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const filteredPositions = useMemo(() => {
    const timeFilteredPositions = getTimeFilteredPositions(
      positions,
      timeFilter
    );
    const filtered = timeFilteredPositions.filter((position) => {
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "open" && position.isOpen) ||
        (filters.status === "closed" && !position.isOpen);
      const matchesRange =
        filters.range === "all" ||
        (filters.range === "in" && position.isInRange) ||
        (filters.range === "out" && !position.isInRange);

      const matchesChain =
        filters.chain === "all" ||
        position.chain.id.toString() === filters.chain;

      return matchesStatus && matchesChain && matchesRange;
    });

    // Sort positions
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (filters.sortBy) {
        case "value":
          aVal = a.totalValueUSD;
          bVal = b.totalValueUSD;
          break;
        case "fees":
          aVal = a.feesEarnedUSD;
          bVal = b.feesEarnedUSD;
          break;
        case "apr":
          aVal = a.apr;
          bVal = b.apr;
          break;
        case "created":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      return filters.sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [timeFilter, filters, positions]);

  const stats = useMemo(() => {
    const activePositions = filteredPositions.filter((p) => p.isOpen);
    const inRangePositions = activePositions.filter((p) => p.isInRange);
    const totalValue = filteredPositions.reduce(
      (sum, p) => sum + p.totalValueUSD,
      0
    );
    const totalFees = filteredPositions.reduce(
      (sum, p) => sum + p.feesEarnedUSD,
      0
    );
    const totalUnclaimedFees = filteredPositions.reduce(
      (sum, p) => sum + p.unClaimedFees.amountUSD,
      0
    );

    const totalProjection24hUSD = filteredPositions.reduce(
      (sum, p) => sum + (p.feesEarnedUSD * p.apr) / 365,
      0
    );

    const totalDeposited = filteredPositions.reduce(
      (sum, p) =>
        sum +
        Number(p.depositedToken0) * p.token0.priceUSD +
        Number(p.depositedToken1) * p.token1.priceUSD,
      0
    );

    function calculateAPR(totalValue: number, dailyFees: number): number {
      const daysInYear = 365;
      const annualFees = dailyFees * daysInYear;
      const apr = (annualFees / totalValue) * 100;
      return apr;
    }

    const totalAPR = calculateAPR(totalValue, totalProjection24hUSD) || 0;
    // inRangePositions.length > 0
    //   ? inRangePositions.reduce((sum, p) => sum + p.apr, 0) / inRangePositions.length
    //   : 0;

    return {
      totalValue,
      totalFees,
      totalUnclaimedFees,
      totalDeposited,
      activePositions: activePositions.length,
      inRangePositions: inRangePositions.length,
      totalAPR,
      totalProjection24hUSD,
    };
  }, [filteredPositions]);

  const portfolioAnalyticsData = useMemo(() => {
    return {
      ...convertPositionsToPortfolioData(filteredPositions),
      hideTimeline: true,
    };
  }, [filteredPositions]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const loadAddress = async () => {
      const input = addressToValidate || localStorage.getItem("evmAddress");
      if (!input) {
        setEvmAddress(undefined);
        return;
      }
      const valideEVMAddress = await validateAndResolveAddress(input);
      if (valideEVMAddress) {
        setEvmAddress(valideEVMAddress);
        if (!addressToValidate) {
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("address", valideEVMAddress);
            return newParams;
          });
        }
      } else {
        setEvmAddress(undefined);
      }
    };
    loadAddress();
  }, [addressToValidate]);

  const TimeFilterSelector: React.FC = () => {
    const timeOptions: { value: TimeFilter; label: string }[] = [
      { value: "24h", label: "24h" },
      { value: "7d", label: "7d" },
      { value: "30d", label: "30d" },
      { value: "90d", label: "90d" },
      { value: "all", label: "All" },
    ];

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Timeframe
        </span>
        <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-gray-100 rounded-lg p-1">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFilter(option.value)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                timeFilter === option.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAddressChange = async (address: string) => {
    const resolvedAddress = await validateAndResolveAddress(address);
    if (resolvedAddress) {
      console.log(`Resolved address: ${resolvedAddress}`);

      setEvmAddress(resolvedAddress);
      // update url search params
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("address", resolvedAddress);
        return newParams;
      });
      localStorage.setItem("evmAddress", resolvedAddress);
    } else {
      // Gérer l'erreur d'adresse invalide
      alert("Invalid address or ENS name");
      localStorage.removeItem("evmAddress");
      setEvmAddress(undefined);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("address");
        return newParams;
      });
    }
  };

  const handleClearAddress = () => {
    setEvmAddress(undefined);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("address");
      return newParams;
    });
    localStorage.removeItem("evmAddress");
  };

  return (
    <>
      <PositionsHeader
        {...stats}
        currentAddress={evmAddress || ""}
        onAddressChange={handleAddressChange}
        onClearAddress={handleClearAddress}
        loading={loading}
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="w-full lg:w-auto">
          <TimeFilterSelector />
        </div>

        {/* Toggle Analytics Button */}
        {filteredPositions.length > 0 && (
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              showAnalytics
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{showAnalytics ? "Hide Analytics" : "Show Analytics"}</span>
          </button>
        )}
      </div>

      {/* Analytics Panel */}
      {showAnalytics && filteredPositions.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <PortfolioYieldChart data={portfolioAnalyticsData} />
            </div>
          </div>
        </div>
      )}

      {!showAnalytics && filteredPositions.length > 0 && (
        <>
          <PositionsFilters
            filters={filters}
            onFiltersChange={setFilters}
            chains={NETWORKS}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {filteredPositions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))}
          </div>
        </>
      )}

      {filteredPositions.length === 0 && loading === false && (
        <div className="text-center py-16">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No positions found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or create your first position
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="relative inline-block mb-4">
            <svg
              className="animate-spin h-16 w-16 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-500 font-medium">Loading positions...</p>
        </div>
      )}

      {error && loading === false && (
        <div className="text-red-500 text-center py-16">
          <p>Error loading positions: {error}</p>
        </div>
      )}
    </>
  );
};
