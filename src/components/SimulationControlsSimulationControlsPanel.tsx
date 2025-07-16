import { DollarSign, Settings } from "lucide-react";
import { PoolInformation } from "./PoolInformation";
import { PriceRangeSelector } from "./PriceRangeSelector";
import { PoolColumnDataType } from "../types";

export const SimulationControlsPanel = ({
  liquidityAmount,
  setLiquidityAmount,
  timeframe,
  setTimeframe,
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
  liquidityAmount: number;
  setLiquidityAmount: (value: number) => void;
  timeframe: number;
  setTimeframe: (value: number) => void;
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
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <Settings className="w-6 h-6 text-purple-500" />
      Simulation Controls
    </h3>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Liquidity Amount (USD)
        </label>
        <div className="relative">
          <input
            type="number"
            value={liquidityAmount}
            onChange={(e) => setLiquidityAmount(Number(e.target.value))}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            placeholder="10000"
          />
          <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Timeframe
        </label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
        >
          <option value={7}>1 day</option>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      <PriceRangeSelector
        isFullRange={isFullRange}
        setIsFullRange={setIsFullRange}
        currentPrice={currentPrice}
        priceRangeMin={priceRangeMin}
        setPriceRangeMin={setPriceRangeMin}
        priceRangeMax={priceRangeMax}
        setPriceRangeMax={setPriceRangeMax}
        liquidityConcentration={liquidityConcentration}
        currentPool={currentPool}
      />

      <PoolInformation currentPool={currentPool} />
    </div>
  </div>
);