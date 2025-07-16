import { Target } from "lucide-react";
import { PoolColumnDataType } from "../types";

export const PriceRangeSelector = ({
  isFullRange,
  setIsFullRange,
  currentPrice,
  priceRangeMin,
  setPriceRangeMin,
  priceRangeMax,
  setPriceRangeMax,
  liquidityConcentration,
  currentPool,
}: {
  isFullRange: boolean;
  setIsFullRange: (value: boolean) => void;
  currentPrice: number;
  priceRangeMin: number;
  setPriceRangeMin: (value: number) => void;
  priceRangeMax: number;
  setPriceRangeMax: (value: number) => void;
  liquidityConcentration: number;
  currentPool: PoolColumnDataType; // Replace with actual type if available
}) => (
  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-500" />
        Price Range
      </h4>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="fullRange"
          checked={isFullRange}
          onChange={(e) => setIsFullRange(e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
        />
        <label
          htmlFor="fullRange"
          className="text-sm font-medium text-gray-700"
        >
          Full Range
        </label>
      </div>
    </div>

    {!isFullRange && (
      <div className="space-y-4">
        <div className="text-center mb-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-800">
            {currentPrice.toFixed(4)}
          </div>
          <div className="text-sm font-medium text-gray-600">
            Current Price ({currentPool?.token0.symbol}/
            {currentPool?.token1.symbol})
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={priceRangeMin}
              onChange={(e) => setPriceRangeMin(Number(e.target.value))}
              step="0.0001"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={priceRangeMax}
              onChange={(e) => setPriceRangeMax(Number(e.target.value))}
              step="0.0001"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Liquidity Concentration:
            </span>
            <span className="text-xl font-bold text-purple-600">
              {liquidityConcentration.toFixed(2)}x
            </span>
          </div>
          <div className="text-xs font-medium text-gray-600 mt-1">
            Higher concentration = More fees (when price is in range)
          </div>
        </div>

        <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Price Range</span>
            <span className="text-gray-800 font-semibold">
              {priceRangeMin.toFixed(4)} - {priceRangeMax.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Range Size</span>
            <span className="text-gray-800 font-semibold">
              {(((priceRangeMax - priceRangeMin) / currentPrice) * 100).toFixed(
                1
              )}
              %
            </span>
          </div>
        </div>
      </div>
    )}

    {isFullRange && (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-700 mb-2">
            Full Range Position
          </div>
          <div className="text-sm font-medium text-green-600">
            Your liquidity will be active at all price levels
          </div>
          <div className="text-xs font-medium text-gray-600 mt-1">
            Lower fees but no impermanent loss risk
          </div>
        </div>
      </div>
    )}
  </div>
);