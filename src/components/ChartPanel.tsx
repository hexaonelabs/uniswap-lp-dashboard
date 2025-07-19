import { BarChart3 } from "lucide-react";
import CorrelationChart, { CorrelationDataInterface } from "./CorrelationChart";

export const ChartPanel = ({
  correlationData,
  currentPrice,
  priceRangeMin,
  priceRangeMax,
  isFullRange,
  token0,
  token1,
}: {
  correlationData: CorrelationDataInterface;
  currentPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  isFullRange: boolean;
  token0: {
    symbol: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    decimals: number;
  };
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-500" />
        {token0.symbol} / {token1.symbol} Pool Chart
      </h3>
    </div>

    <CorrelationChart
      state={{
        data: correlationData,
        priceAssumptionValue: currentPrice,
        priceRangeValue: [priceRangeMin, priceRangeMax],
        isFullRange: isFullRange,
        token0: token0,
        token1: token1,
        pool: {
          token0: {
            symbol: token0.symbol,
            decimals: token0.decimals,
            priceUSD: currentPrice, // Utiliser le prix actuel pour le token0
          },
          token1: {
            symbol: token1.symbol,
            decimals: token1.decimals,
            priceUSD: 1, // Token1 est la référence (toujours 1 dans le ratio)
          },
        },
      }}
    />
  </div>
);
