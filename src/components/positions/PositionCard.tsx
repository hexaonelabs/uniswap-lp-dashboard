import React, { useState } from "react";
import {
  ExternalLink,
  // TrendingUp,
  // TrendingDown,
  AlertCircle,
  CheckCircle,
  Calculator,
  Eye,
} from "lucide-react";
import { Position } from "../../types";
import { Calculator as CalculatorModal } from "../Calculator";
import { useNavigate } from "react-router-dom";
import { TokenSymbolsGroup } from "../TokenSymbolsGroup";

interface PositionCardProps {
  position: Position;
}

export const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // const formatPrice = (price: number) => {
  //   return price > 1 ? `$${price.toLocaleString()}` : `$${price.toFixed(6)}`;
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          <div className="flex items-center justify-between mb-8">
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
              <TokenSymbolsGroup tokens={{
                token0: position.token0,
                token1: position.token1
              }} />
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
                  {position.unClaimedFees.amountUSD
                    .toFixed(2)
                    .toLocaleString()}{" "}
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
                    left: `${position.token0BalancePercentage}%` 
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Navigate to estimate page with searchParams from currrent position
                  const url = `/estimate?chainId=${position.chain.id}&poolAddress=${position.poolAddress}&minPrice=${position.priceRange.min}&maxPrice=${position.priceRange.max}&liquidityAmount=${position.totalValueUSD.toFixed(2)}`;
                  navigate(url);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculator</span>
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Details</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Created {formatDate(position.createdAt)}</span>
              <button className="text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pool Address</p>
                  <p className="font-mono text-xs text-gray-800">
                    {position.poolAddress}
                  </p>
                </div>
                <div></div>
                <div>
                  <p className="text-gray-500">Position ID</p>
                  <p className="font-mono text-xs text-gray-800">
                    {position.id}
                  </p>
                </div>
                <div></div>
                <div>
                  <p className="text-gray-500">Tokens LP</p>
                  <p className="font-mono text-xs text-gray-800">
                    {position.token0.symbol} / {position.token1.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="text-gray-800">
                    {new Date(position.lastUpdated).toLocaleDateString()}{" "}
                    {new Date(position.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Initial Deposit Liquidity</p>
                  <p className="font-mono text-xs text-gray-800">
                    {position.depositedToken0} {position.token0.symbol} /{" "}
                    {position.depositedToken1} {position.token1.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Initial Deposit USD</p>
                  <p className="font-mono text-xs text-gray-800">
                    $
                    {(
                      parseFloat(position.depositedToken0) *
                        position.token0.priceUSD +
                      parseFloat(position.depositedToken1) *
                        position.token1.priceUSD
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Current Liquidity</p>
                  <p className="font-mono text-xs text-gray-800">
                    {position.tokensOwed0} {position.token0.symbol} /{" "}
                    {position.tokensOwed1} {position.token1.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Current USD</p>
                  <p className="font-mono text-xs text-gray-800">
                    ${position.totalValueUSD.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price Range</p>
                  <p className="text-gray-800">
                    {position.priceRange.min} to {position.priceRange.max}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total fees earned USD</p>
                  <p className="text-gray-800">
                    ${(position.feesEarnedUSD).toFixed(2)}
                    <span className="text-xs text-gray-500">
                      {" ("}
                      ${(position.feesEarnedUSD - position.unClaimedFees.amountUSD).toFixed(2)} claimed + 
                      ${position.unClaimedFees.amountUSD.toFixed(2)} unclaimed
                      {")"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Current Price</p>
                  <p className="text-gray-800">
                    {position.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">APR</p>
                  <p className="text-gray-800">
                    {position.apr.toFixed(2)}%
                    <span className="text-xs text-gray-500">
                      {" (24h projection: "}
                      ${((position.feesEarnedUSD * position.apr) / 365).toFixed(2)}
                      {")"}
                    </span>
                  </p>
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-4 text-sm mt-12">
                <div>
                  <p className="text-gray-500">Pool Liquidity</p>
                  <p className="text-gray-800">
                    {parseInt(position.liquidity).toLocaleString()}
                  </p>
                </div>

              </div> */}
            </div>
          )}
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <CalculatorModal
          position={position}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </>
  );
};
