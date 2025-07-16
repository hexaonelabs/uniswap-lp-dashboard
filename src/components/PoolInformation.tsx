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
        <span className="font-medium text-gray-600">TVL:</span>
        <span className="font-bold text-gray-800">
          ${currentPool?.totalValueLockedUSD?.toLocaleString() || "N/A"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">Volume 24h:</span>
        <span className="font-bold text-gray-800">
          ${currentPool?.volume24h?.toLocaleString() || "N/A"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium text-gray-600">Fees:</span>
        <span className="font-bold text-gray-800">
          {((Number(currentPool?.feeTier) || 0) * 100).toFixed(3)}%
        </span>
      </div>
    </div>
  </div>
);