import React, { useEffect, useState } from "react";
import {
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  X,
  Search,
} from "lucide-react";

interface PositionsHeaderProps {
  totalValue: number;
  totalFees: number;
  totalUnclaimedFees?: number;
  totalProjection24hUSD?: number;
  activePositions: number;
  inRangePositions?: number;
  totalAPR: number;
  currentAddress?: string;
  onAddressChange: (address: string) => void;
  onClearAddress: () => void;
  loading?: boolean;
}

export const PositionsHeader: React.FC<PositionsHeaderProps> = ({
  totalValue,
  totalFees,
  totalUnclaimedFees = 0,
  inRangePositions = 0,
  totalProjection24hUSD = 0,
  activePositions,
  totalAPR,
  currentAddress = "",
  onAddressChange,
  onClearAddress,
  loading = false,
}) => {
  const [inputAddress, setInputAddress] = useState(currentAddress);

  const handleCheck = () => {
    if (inputAddress.trim()) {
      onAddressChange(inputAddress.trim());
    }
  };

  const handleClear = () => {
    setInputAddress("");
    onClearAddress();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  // Mettre à jour l'input quand l'adresse courante change
  useEffect(() => {
    setInputAddress(currentAddress);
  }, [currentAddress]);
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white p-8 rounded-2xl shadow-xl mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Activity className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Uniswap LP Dashboard
            </h1>
            <p className="text-blue-200 mt-1">
              Track and optimize your liquidity positions
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        {/* Input address */}
        <div className="mb-2 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Enter EVM address or ENS name..."
                className="w-full px-4 py-3 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={loading}
              />
              {inputAddress && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={!inputAddress.trim() || loading}
              className="w-full sm:w-auto sm:min-w-[120px] px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-300" />
            </div>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              +2.4%
            </span>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Value</p>
            <p className="text-2xl font-bold">
              ${totalValue.toFixed(2).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-300" />
            </div>
            {/* <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              +12.8%
            </span> */}
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Fees Earned</p>
            <p className="text-2xl font-bold">
              ${totalFees.toFixed(2).toLocaleString()}
            </p>
            <p className="text-xs text-blue-200 mt-1">
              Unclaimed: ${totalUnclaimedFees.toFixed(2).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Active Positions</p>
            <p className="text-2xl font-bold">
              {inRangePositions}/{activePositions}
            </p>
            <p className="text-xs text-blue-200 mt-1">Currently in Range</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-300" />
            </div>
            {/* <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              +0.8%
            </span> */}
          </div>
          <div>
            <p className="text-blue-200 text-sm">Average APR</p>
            <p className="text-2xl font-bold">{totalAPR?.toFixed(2)}%</p>
            <p className="text-xs text-blue-200 mt-1">
              Projected 24h: $
              {totalProjection24hUSD.toFixed(2).toLocaleString()}
            </p>
          </div>
        </div>

        {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-300" />
            </div>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              +{((projection24h / totalValue) * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <p className="text-blue-200 text-sm">24h Projection</p>
            <p className="text-2xl font-bold">${projection24h.toFixed(2)}</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};
