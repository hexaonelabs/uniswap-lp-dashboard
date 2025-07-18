import { BarChart3 } from "lucide-react";
import CorrelationChart from "./CorrelationChart";

export const ChartPanel = ({
  correlationData,
  currentPrice,
  priceRangeMin,
  priceRangeMax,
  isFullRange,
  token0,
  token1,
}: {
  correlationData: Array<{
    timestamp: number;
    date: string;
    fees: number;
    impermanentLoss: number;
    netEarnings: number;
    apy: number;
    price0: number;
    price1: number;
    relativePrice: number; // Ajouter cette propriété
    volume: number;
    tvl: number;
  }>;
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
        token0PriceChart: {
          prices: correlationData.map((data) => ({
            timestamp: data.timestamp,
            value: data.relativePrice, // Utiliser relativePrice au lieu de price0
          })),
        },
        token1PriceChart: {
          prices: correlationData.map((data) => ({
            timestamp: data.timestamp,
            value: 1, // Token1 est la référence (toujours 1 dans le ratio)
          })),
        },
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
