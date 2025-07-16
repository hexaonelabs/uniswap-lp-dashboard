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
    volume: number;
    tvl: number;
  }>;
  currentPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  isFullRange: boolean;
  token0: {
    symbol: string;
  };
  token1: {
    symbol: string;
  };
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-500" />
        {token0.symbol} / {token1.symbol} Pool Chart
      </h3>
    </div>

    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <CorrelationChart
        state={{
          token0PriceChart: {
            prices: correlationData.map((data) => ({
              timestamp: data.timestamp,
              value: data.price0,
            })),
          },
          token1PriceChart: {
            prices: correlationData.map((data) => ({
              timestamp: data.timestamp,
              value: data.price1,
            })),
          },
          priceAssumptionValue: currentPrice,
          priceRangeValue: [priceRangeMin, priceRangeMax],
          isFullRange: isFullRange,
        }}
      />
    </div>

    {/* Métriques supplémentaires */}
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-600 mb-1">Total Fees</div>
        <div className="text-xl font-bold text-green-600">
          $
          {correlationData.reduce((sum, data) => sum + data.fees, 0).toFixed(2)}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-600 mb-1">
          Impermanent Loss
        </div>
        <div className="text-xl font-bold text-red-500">
          $
          {Math.abs(
            correlationData.reduce((sum, data) => sum + data.impermanentLoss, 0)
          ).toFixed(2)}
        </div>
      </div>
    </div>
  </div>
);