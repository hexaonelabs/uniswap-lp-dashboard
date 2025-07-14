import React, { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { Filters } from "./components/Filters";
import { PositionCard } from "./components/PositionCard";
import { Chart } from "./components/Chart";
import { PoolSearch } from "./components/PoolSearch";
import { FilterOptions, Position, TimeFilter } from "./types";
import {
  // mockPositions,
  mockChartData,
  mockPools,
} from "./data/mockData";
import { usePositions } from "./hooks/usePositions";
import { NETWORKS } from "./services/fetcher";
import { validateAndResolveAddress } from "./data/data";
import Footer from "./components/Footer";

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

const getAddressFromUrl = async (): Promise<string | null> => {
  const path = window.location.pathname;
  const match = path.match(/^\/?(.*?)$/);
  if (match && match[1]) {
    const input = decodeURIComponent(match[1]);
    const resolvedAddress = await validateAndResolveAddress(input);
    return resolvedAddress || null;
  }
  return null;
};

function App() {
  const [evmAddress, setEvmAddress] = useState<string | undefined>(undefined);
  const { positions, loading, error } = usePositions(evmAddress);

  const [filters, setFilters] = useState<FilterOptions>({
    status: "open",
    range: "all",
    chain: "all",
    sortBy: "created",
    sortOrder: "desc",
  });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [activeTab, setActiveTab] = useState<
    "positions" | "analytics" | "pools"
  >("positions");

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
    // const totalAPR = totalValue > 0
    //   ? (totalProjection24hUSD / totalValue) * 100
    //   : 0;
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
      activePositions: activePositions.length,
      inRangePositions: inRangePositions.length,
      totalAPR,
      totalProjection24hUSD,
    };
  }, [filteredPositions]);

  useEffect(() => {
    const loadAddress = async () => {
      const addressFromUrl = await getAddressFromUrl();
      if (addressFromUrl) {
        setEvmAddress(addressFromUrl);
      } else {
        setEvmAddress(undefined);
      }
    };
    loadAddress();
  }, []);
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

  const TabButton: React.FC<{
    tab: typeof activeTab;
    label: string;
    isActive: boolean;
  }> = ({ tab, label, isActive }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 font-medium rounded-lg transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const handleAddressChange = async (address: string) => {
    const resolvedAddress = await validateAndResolveAddress(address);
    if (resolvedAddress) {
      console.log(`Resolved address: ${resolvedAddress}`);

      setEvmAddress(resolvedAddress);
      // Optionnel : mettre à jour l'URL
      window.history.pushState({}, "", `/${resolvedAddress}`);
    } else {
      // Gérer l'erreur d'adresse invalide
      alert("Invalid address or ENS name");
    }
  };

  const handleClearAddress = () => {
    setEvmAddress(undefined);
    // Optionnel : nettoyer l'URL
    window.history.pushState({}, "", "/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:px-8 sm:py-8 w-full">
        <Header
          {...stats}
          currentAddress={evmAddress || ""}
          onAddressChange={handleAddressChange}
          onClearAddress={handleClearAddress}
          loading={loading}
        />

        {/* Navigation Tabs */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <TabButton
              tab="positions"
              label="Positions"
              isActive={activeTab === "positions"}
            />
            {/* <TabButton
              tab="analytics"
              label="Analytics"
              isActive={activeTab === "analytics"}
            /> */}
            <TabButton
              tab="pools"
              label="Best Pools"
              isActive={activeTab === "pools"}
            />
          </div>
          <div className="w-full lg:w-auto">
            <TimeFilterSelector />
          </div>
        </div>

        {/* Content */}
        {activeTab === "positions" && (
          <>
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              chains={NETWORKS}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {filteredPositions.map((position) => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>

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
                <p className="text-gray-500 font-medium">
                  Loading positions...
                </p>
              </div>
            )}

            {error && loading === false && (
              <div className="text-red-500 text-center py-16">
                <p>Error loading positions: {error}</p>
              </div>
            )}
          </>
        )}

        {activeTab === "analytics" && <Chart data={mockChartData} />}

        {activeTab === "pools" && <PoolSearch pools={mockPools} />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
