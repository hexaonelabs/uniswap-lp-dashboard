import { Info } from "lucide-react";
import { PoolColumnDataType } from "../types";
import { useMemo } from "react";
import {
  calculateTokenPriceCorrelation,
  calculateVolumeVolatility,
} from "../utils/uniswap/helper";

export const PoolInformation = ({
  currentPool,
  timeframe = 30, // Default to 30 days if not provided
  tokensDayDatas = [],
}: {
  currentPool: PoolColumnDataType;
  timeframe?: number; // Number of days for volume volatility calculation
  tokensDayDatas?: Array<{
    token0Price: string | number;
    token1Price: string | number;
    date: number;
    volumeUSD: string | number;
  }>;
}) => {
  const volumeVolatility = useMemo(() => {
    if (!currentPool)
      return {
        volatility: 0,
        averageVolume: 0,
        standardDeviation: 0,
        coefficient: "Unknown",
      };

    return calculateVolumeVolatility(currentPool.poolDayDatas, timeframe);
  }, [currentPool, timeframe]);

  const priceCorrelation = useMemo(() => {
    if (!tokensDayDatas || tokensDayDatas.length === 0)
      return {
        correlation: 0,
        classification: "Unknown",
        impermanentLossRisk: "Medium",
        dataPoints: 0,
      };
    return calculateTokenPriceCorrelation(tokensDayDatas, timeframe);
  }, [tokensDayDatas, timeframe]);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-purple-500" />
        <span className="text-sm font-bold text-purple-700">
          Pool Information
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Address:</span>
          <span className="font-bold text-gray-800">
            {currentPool.poolId.slice(0, 6)}...{currentPool.poolId.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Tokens:</span>
          <span className="font-bold text-gray-800">
            {currentPool.token0.symbol} / {currentPool.token1.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Fees tier:</span>
          <span className="font-bold text-gray-800">
            {((Number(currentPool?.feeTier) || 0) / 10000).toFixed(2)}%
          </span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">TVL:</span>
          <span className="font-bold text-gray-800">
            $
            {Number(
              currentPool?.totalValueLockedUSD?.toFixed(0)
            ).toLocaleString() || "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Volume 24h:</span>
          <span className="font-bold text-gray-800">
            $
            {Number(currentPool?.volume24h.toFixed(0))?.toLocaleString() ||
              "N/A"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Daily Volume / TVL:</span>
          <span className="font-bold text-gray-800">
            {currentPool.dailyVolumePerTVL.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Daily Fees / TVL:</span>
          <span className="font-bold text-gray-800">
            {currentPool.dailyFeesPerTVL.toFixed(4)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Fees 24h:</span>
          <span className="font-bold text-gray-800">
            ${Number(currentPool.fee24h.toFixed(0)).toLocaleString() || "N/A"}
          </span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Price volatility:</span>
          <span className="font-bold text-gray-800">
            {currentPool.priceVolatility24HPercentage.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Volume volatility:</span>
          <span className="font-bold text-gray-800">
            {volumeVolatility.volatility.toFixed(2)}%
          </span>
        </div>
        <hr/>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">
            Volume volatility coefficient:
          </span>
          <span className={`font-bold ${
            (volumeVolatility.coefficient === "Stable")
              ? "text-green-600"
              : volumeVolatility.coefficient === "Moderate"
              ? "text-yellow-600"
              : "text-red-600"
          }`}>
            {volumeVolatility.coefficient}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Price correlation:</span>
          <span
            className={`font-bold ${
              priceCorrelation.correlation > 0.3
                ? "text-green-600"
                : priceCorrelation.correlation < -0.3
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {priceCorrelation.correlation.toFixed(3)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Correlation type:</span>
          <span className={`font-bold ${
            (priceCorrelation.classification === "Moderate Positive" || priceCorrelation.classification === "Strong Positive")
              ? "text-green-600"
              : priceCorrelation.classification === "Weak"
              ? "text-yellow-600"
              : "text-red-600"
          }`} >
            {priceCorrelation.classification}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-600">IL Risk:</span>
          <span
            className={`font-bold ${
              priceCorrelation.impermanentLossRisk === "Very Low" ||
              priceCorrelation.impermanentLossRisk === "Low"
                ? "text-green-600"
                : priceCorrelation.impermanentLossRisk === "Medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {priceCorrelation.impermanentLossRisk}
          </span>
        </div>
      </div>
    </div>
  );
};
