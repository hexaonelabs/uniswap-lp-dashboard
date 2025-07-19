import React, { useState, useCallback } from "react";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { PositionsFilterOptions } from "../../types";
import { Network } from "../../services/fetcher";

interface PositionsFiltersProps {
  filters: PositionsFilterOptions;
  onFiltersChange: (filters: PositionsFilterOptions) => void;
  chains: Network[];
}

export const PositionsFilters: React.FC<PositionsFiltersProps> = ({
  filters,
  onFiltersChange,
  chains,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof PositionsFilterOptions, value: string) => {
      const range =
        key === "status" && value === "closed" ? "all" : filters.range;
      onFiltersChange({ ...filters, range, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.range !== "all") count++;
    if (filters.chain !== "all") count++;
    if (filters.sortBy.length !== 0) count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    onFiltersChange({
      status: "open",
      range: "all",
      chain: "all",
      sortBy: "created",
      sortOrder: "desc",
    });
  }, [onFiltersChange]);

  const getChainName = useCallback(
    (chainId: string) => {
      if (chainId === "all") return null;
      return chains.find((chain) => chain.id.toString() === chainId)?.name;
    },
    [chains]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-75 active:scale-95"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-75 active:scale-95"
            >
              <span className="hidden sm:inline">More filters</span>
              <span className="sm:hidden">More</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pills */}
        <div className="overflow-x-auto pb-2 -mx-1">
          <div className="flex space-x-2 px-1 min-w-max">
            {/* Status Pills */}
            <button
              onClick={() =>
                handleFilterChange(
                  "status",
                  filters.status === "open" ? "all" : "open"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.status === "open"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>

            <button
              onClick={() =>
                handleFilterChange(
                  "status",
                  filters.status === "closed" ? "all" : "closed"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.status === "closed"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Closed</span>
            </button>

            {/* Range Pills */}
            <button
              onClick={() =>
                handleFilterChange(
                  "range",
                  filters.range === "in" ? "all" : "in"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.range === "in"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>In Range</span>
            </button>

            <button
              onClick={() =>
                handleFilterChange(
                  "range",
                  filters.range === "out" ? "all" : "out"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.range === "out"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Out Range</span>
            </button>

            {/* Sort Pills */}
            <button
              onClick={() =>
                handleFilterChange(
                  "sortBy",
                  filters.sortBy === "value" ? "fees" : "value"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.sortBy === "value"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>By Value</span>
            </button>

            <button
              onClick={() =>
                handleFilterChange(
                  "sortBy",
                  filters.sortBy === "created" ? "value" : "created"
                )
              }
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-75 active:scale-95 ${
                filters.sortBy === "created"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>By Date</span>
            </button>

            {/* Chain active indicator */}
            {filters.chain !== "all" && (
              <button
                onClick={() => handleFilterChange("chain", "all")}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all duration-75 active:scale-95"
              >
                <span>{getChainName(filters.chain)}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section avancée collapsible */}
      {showAdvanced && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 animate-in slide-in-from-top duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Chain
              </label>
              <select
                value={filters.chain}
                onChange={(e) => handleFilterChange("chain", e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-75"
              >
                <option value="all">All Chains</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id.toString()}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-75"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-75"
              >
                <option value="value">Value</option>
                <option value="fees">Fees</option>
                <option value="apr">APR</option>
                <option value="created">Date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-75"
              >
                <option value="desc">High → Low</option>
                <option value="asc">Low → High</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
