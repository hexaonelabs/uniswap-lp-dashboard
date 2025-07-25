import React from "react";
import {
  // TrendingUp,
  // TrendingDown,
  AlertCircle,
  CheckCircle,
  Calculator,
  Eye,
} from "lucide-react";
import { Position } from "../../types";
// import { Calculator as CalculatorModal } from "../Calculator";
import { useNavigate } from "react-router-dom";
import { TokenSymbolsGroup } from "../TokenSymbolsGroup";
import ClaimFeesButton from "../ClaimFeesButton";

interface PositionCardProps {
  position: Position;
}

export const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  // const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();

  // const formatPrice = (price: number) => {
  //   return price > 1 ? `$${price.toLocaleString()}` : `$${price.toFixed(6)}`;
  // };
  const handleViewDetails = () => {
    const serializablePosition = {
      id: position.id,
      token0: {
        symbol: position.token0.symbol,
        logoURI: position.token0.logoURI,
        address: position.token0.address,
        priceUSD: position.token0.priceUSD,
      },
      token1: {
        symbol: position.token1.symbol,
        logoURI: position.token1.logoURI,
        address: position.token1.address,
        priceUSD: position.token1.priceUSD,
      },
      chain: {
        id: position.chain.id,
        name: position.chain.name,
        logoURI: position.chain.logoURI,
      },
      feeTier: position.feeTier,
      totalValueUSD: position.totalValueUSD,
      feesEarnedUSD: position.feesEarnedUSD,
      apr: position.apr,
      isOpen: position.isOpen,
      isInRange: position.isInRange,
      poolAddress: position.poolAddress,
      currentPrice: position.currentPrice,
      priceRange: position.priceRange,
      token0BalancePercentage: position.token0BalancePercentage,
      tokensOwed0: position.tokensOwed0,
      tokensOwed1: position.tokensOwed1,
      depositedToken0: position.depositedToken0,
      depositedToken1: position.depositedToken1,
      unClaimedFees: position.unClaimedFees,
      createdAt: position.createdAt,
      lastUpdated: position.lastUpdated,
    };
    navigate(`/positions/${position.id}`, {
      state: { position: serializablePosition },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = () => {
    if (!position.isOpen) return "bg-gray-100 text-gray-700";
    if (position.isInRange) return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusIcon = () => {
    if (!position.isOpen) return <AlertCircle className="w-4 h-4" />;
    if (position.isInRange) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!position.isOpen) return "Closed";
    if (position.isInRange) return "In Range";
    return "Out of Range";
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-8"
            onClick={handleViewDetails}
          >
            <div className="flex items-center space-x-3">
              {/* <div className="flex items-center space-x-2">
                <img
                  src={position.token0.logoURI}
                  alt={position.token0.symbol}
                  className="w-10 h-10 rounded-full"
                />
                <img
                  src={position.token1.logoURI}
                  alt={position.token1.symbol}
                  className="w-10 h-10 rounded-full -ml-2"
                />
              </div> */}
              <TokenSymbolsGroup
                tokens={{
                  token0: position.token0,
                  token1: position.token1,
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {position.token0.symbol}/{position.token1.symbol}
                </h3>
                <p className="text-sm text-gray-500">
                  {position.feeTier / 10000}% • {position.chain.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </span>
              <img
                src={position.chain.logoURI}
                alt={position.chain.name}
                className="w-5 h-5 rounded-full"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-semibold text-gray-800">
                ${position.totalValueUSD.toFixed(2).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Fees Earned</p>
              <p className="text-lg font-semibold text-green-600">
                ${position.feesEarnedUSD.toFixed(2).toLocaleString()}
                <span className="text-xs font-normal text-gray-500">
                  {" "}
                  {"("}$
                  {position.unClaimedFees.amountUSD.toFixed(2).toLocaleString()}{" "}
                  unclaimed{")"}
                </span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">APR</p>
              <p className="text-lg font-semibold text-blue-600">
                {position.apr.toFixed(2)}%
              </p>
            </div>
            {/* <div className="text-center">
              <p className="text-sm text-gray-500">IL</p>
              <p className={`text-lg font-semibold ${position.impermanentLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {position.impermanentLoss > 0 ? '+' : ''}{position.impermanentLoss.toFixed(2)}%
              </p>
            </div> */}
          </div>

          {/* Price Range */}
          <div className="mt-8 mb-12">
            {/* <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Price Range</span>
              <span className="text-sm text-gray-500">
                Current: {position.currentPrice}
              </span>
            </div> */}
            {/* <div className="relative">
              <div className="w-full bg-blue-500 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-purple-900`}
                  style={{ width: `${position.token0BalancePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{position.priceRange.min}</span>
                <span>{position.priceRange.max}</span>
              </div>
            </div> */}

            <div className="relative">
              {/* Range bar */}
              <div className="w-full bg-purple-600 rounded-full h-1 relative">
                <div
                  className="h-1 rounded-full bg-blue-500 "
                  style={{ width: `${position.token0BalancePercentage}%` }}
                />

                {/* Current price indicator */}
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg"
                  style={{
                    left: `${position.token0BalancePercentage}%`,
                  }}
                />
              </div>

              {/* Range labels */}
              {/* <div className="flex justify-between items-center mt-2">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-light text-gray-400">Min</span>
                  <span className="text-sm font-normal text-blue-500">{position.priceRange.min}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-light text-gray-400">Max</span>
                  <span className="text-sm font-normal text-purple-500">{position.priceRange.max}</span>
                </div>
              </div> */}

              {/* Current price label */}
              {/* <div 
                className="absolute -top-8 transform -translate-x-1/2"
                style={{ 
                  left: `${position.token0BalancePercentage}%` 
                }}
              >
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {position.currentPrice}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-500 mx-auto"></div>
              </div> */}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200">
            {/* Desktop layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `/estimate?chainId=${
                      position.chain.id
                    }&poolAddress=${position.poolAddress}&minPrice=${
                      position.priceRange.min
                    }&maxPrice=${
                      position.priceRange.max
                    }&liquidityAmount=${position.totalValueUSD.toFixed(2)}`;
                    navigate(url);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>

                <ClaimFeesButton
                  positionId={position.id}
                  chainId={position.chain.id}
                />
              </div>

              <span className="text-xs text-gray-500 pl-4 ">
                Created: {formatDate(position.createdAt)}
              </span>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden space-y-3">
              {/* Buttons grid on mobile */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `/estimate?chainId=${
                      position.chain.id
                    }&poolAddress=${position.poolAddress}&minPrice=${
                      position.priceRange.min
                    }&maxPrice=${
                      position.priceRange.max
                    }&liquidityAmount=${position.totalValueUSD.toFixed(2)}`;
                    navigate(url);
                  }}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden xs:inline">Calculate</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden xs:inline">View</span>
                </button>

                <div className="flex justify-center">
                  <ClaimFeesButton
                    positionId={position.id}
                    chainId={position.chain.id}
                  />
                </div>
              </div>

              <span className="text-xs text-gray-500 block text-center">
                Created: {formatDate(position.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {/* {showCalculator && (
        <CalculatorModal
          position={position}
          onClose={() => setShowCalculator(false)}
        />
      )} */}
    </>
  );
};
