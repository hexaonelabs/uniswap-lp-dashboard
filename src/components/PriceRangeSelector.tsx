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
  currentPool: PoolColumnDataType;
}) => {
  // Calculer les limites basées sur le prix actuel
  const minLimit = currentPrice * 0.5;
  const maxLimit = currentPrice * 1.4;

  const handleMinChange = (value: number) => {
    if (value < priceRangeMax) {
      setPriceRangeMin(value);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value > priceRangeMin) {
      setPriceRangeMax(value);
    }
  };

  const minPercent = ((priceRangeMin - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((priceRangeMax - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Price Range
        </h4>
        <button
          onClick={() => setIsFullRange(!isFullRange)}
          className={`px-3 py-1 rounded-full text-xs font-normal transition-all duration-200 ${
            isFullRange
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isFullRange ? "Full Range" : "Custom"}
        </button>
      </div>

      <div className="text-center mb-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="text-2xl font-bold text-gray-800">
          {currentPrice.toFixed(4)}
        </div>
        <div className="text-sm font-medium text-gray-600">
          Current Price ({currentPool?.token0.symbol}/
          {currentPool?.token1.symbol})
        </div>
      </div>

      {!isFullRange && (
        <div className="space-y-4">
          {/* Double Range Slider */}
          <div className="relative">
            <div className="relative h-2 bg-gray-200 rounded-lg">
              {/* Zone active entre les deux sliders */}
              <div
                className="absolute h-2 bg-purple-500 rounded-lg"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`,
                }}
              />

              {/* Slider Min */}
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={(maxLimit - minLimit) / 1000}
                value={priceRangeMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none
                         [&::-webkit-slider-thumb]:appearance-none 
                         [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 
                         [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-purple-500 
                         [&::-webkit-slider-thumb]:cursor-pointer 
                         [&::-webkit-slider-thumb]:border-2 
                         [&::-webkit-slider-thumb]:border-white 
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:pointer-events-auto
                         [&::-webkit-slider-thumb]:hover:bg-purple-600
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-webkit-slider-thumb]:transition-all"
              />

              {/* Slider Max */}
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={(maxLimit - minLimit) / 1000}
                value={priceRangeMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none
                         [&::-webkit-slider-thumb]:appearance-none 
                         [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 
                         [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-purple-500 
                         [&::-webkit-slider-thumb]:cursor-pointer 
                         [&::-webkit-slider-thumb]:border-2 
                         [&::-webkit-slider-thumb]:border-white 
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:pointer-events-auto
                         [&::-webkit-slider-thumb]:hover:bg-purple-600
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-webkit-slider-thumb]:transition-all"
              />
            </div>

            {/* Indicateurs de prix */}
            {/* <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${minLimit.toFixed(2)}</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Current: ${currentPrice.toFixed(4)}
              </span>
              <span>${maxLimit.toFixed(2)}</span>
            </div> */}
          </div>

          {/* Affichage des valeurs */}
          <div className="flex gap-2 text-sm">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg p-2">
              <div className="text-gray-700 font-medium mb-1">Min</div>
              <input
                type="number"
                value={priceRangeMin.toFixed(4)}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="w-full text-gray-800 font-bold text-sm bg-transparent border-none outline-none focus:ring-0 p-0"
                step="0.0001"
              />
            </div>
            <div className="flex-1 bg-white border border-gray-300 rounded-lg p-2">
              <div className="text-gray-700 font-medium mb-1">Max</div>
              <input
                type="number"
                value={priceRangeMax.toFixed(4)}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="w-full text-gray-800 font-bold text-sm bg-transparent border-none outline-none focus:ring-0 p-0"
                step="0.0001"
              />
            </div>
          </div>

          {/* Boutons de raccourci */}
          <div className="flex gap-2">
            {[5, 10, 25].map((percentage) => (
              <button
                key={percentage}
                onClick={() => {
                  const minPrice = currentPrice * (1 - percentage / 100);
                  const maxPrice = currentPrice * (1 + percentage / 100);
                  setPriceRangeMin(minPrice);
                  setPriceRangeMax(maxPrice);
                }}
                className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              >
                ±{percentage}%
              </button>
            ))}
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
          {/* Concentration de liquidité */}
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
        </div>
      )}

      {isFullRange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-blue-700 font-medium text-sm">
            Full Range Active
          </div>
          <div className="text-blue-600 text-xs mt-1">
            Liquidity active at all price levels
          </div>
        </div>
      )}
    </div>
  );
};
