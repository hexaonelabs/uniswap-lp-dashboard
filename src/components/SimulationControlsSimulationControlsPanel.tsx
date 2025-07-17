import { DollarSign, ExternalLink, Plus, Settings } from "lucide-react";
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
  tokensDayDatas = [],
  onAddToPortfolio,
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
  currentPool: PoolColumnDataType;
  tokensDayDatas?: Array<{
    token0Price: string | number;
    token1Price: string | number;
    date: number;
    volumeUSD: string | number;
  }>;
  onAddToPortfolio?: () => void;
}) => {
  const handleAddToPortfolio = () => {
    if (onAddToPortfolio) {
      onAddToPortfolio();
    }
  };
  const handleOpenPosition = () => {
    // Construire l'URL Uniswap avec les paramètres
    const token0 = currentPool.token0.address;
    const token1 = currentPool.token1.address;
    const chain = currentPool.chain.keyMapper;
    const feeTier = currentPool.feeTier;

    // URL de base Uniswap pour ajouter de la liquidité
    let uniswapUrl = `https://app.uniswap.org/positions/create/v3?currencyA=${token0}&currencyB=${token1}&chain=${chain}&fee=${feeTier}`;
    
    // Ajouter les paramètres de range si ce n'est pas full range
    if (!isFullRange) {
      uniswapUrl += `?minPrice=${priceRangeMin}&maxPrice=${priceRangeMax}`;
    }
    // Ouvrir dans un nouvel onglet
    window.open(uniswapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
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


       <div className="pt-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleAddToPortfolio}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <Plus className="w-5 h-5" />
            Add to Portfolio Builder
          </button>
          
          <button
            onClick={handleOpenPosition}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <ExternalLink className="w-5 h-5" />
            Open Position on Uniswap
          </button>
        </div>

        <PoolInformation
          currentPool={currentPool}
          tokensDayDatas={tokensDayDatas}
          timeframe={14}
        />
      </div>
    </div>
  );
};
