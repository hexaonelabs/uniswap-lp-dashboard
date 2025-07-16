import { Info } from "lucide-react";
import { PoolColumnDataType } from "../types";

export const PoolInformation = ({
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
        <span className="font-medium text-gray-600">Address:</span>
        <span className="font-bold text-gray-800">
          {currentPool.poolId.slice(0,6)}...{currentPool.poolId.slice(-6)}
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
      <hr/>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">TVL:</span>
        <span className="font-bold text-gray-800">
          ${Number(currentPool?.totalValueLockedUSD?.toFixed(0)).toLocaleString() || "N/A"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">Volume 24h:</span>
        <span className="font-bold text-gray-800">
          ${Number(currentPool?.volume24h.toFixed(0))?.toLocaleString() || "N/A"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium text-gray-600">
          Daily Volume / TVL:
        </span>
        <span className="font-bold text-gray-800">
          {currentPool.dailyVolumePerTVL.toFixed(2)}%
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">
          Daily Fees / TVL:
        </span>
        <span className="font-bold text-gray-800">
          {currentPool.dailyFeesPerTVL.toFixed(4)}%
        </span>
      </div>
            <div className="flex justify-between">
        <span className="font-medium text-gray-600">
          Fees 24h:
        </span>
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
    </div>
  </div>
);