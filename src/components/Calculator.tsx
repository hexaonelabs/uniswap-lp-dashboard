import React, { useState } from 'react';
import { X, Calculator as CalculatorIcon, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';
import { Position } from '../types';

interface CalculatorProps {
  position: Position;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ position, onClose }) => {
  const [timeframe, setTimeframe] = useState(30);
  const [priceChange, setPriceChange] = useState(0);
  const [customAmount, setCustomAmount] = useState(position.totalValueUSD);

  const calculateProjections = () => {
    const dailyFees = (position.feesEarnedUSD * (position.apr)) / 365;
    const projectedFees = dailyFees * timeframe;
    const impermanentLossAdjustment = (priceChange * position.impermanentLoss) / 100 * customAmount;
    const finalValue = customAmount + projectedFees + impermanentLossAdjustment;
    
    return {
      dailyFees,
      projectedFees,
      impermanentLossAdjustment,
      finalValue,
      totalReturn: finalValue - customAmount,
      roi: ((finalValue - customAmount) / customAmount) * 100
    };
  };

  const projections = calculateProjections();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalculatorIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Position Calculator</h2>
                <p className="text-gray-600">
                  {position.token0.symbol}/{position.token1.symbol} • {position.chain.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount ($)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe (days)
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1/24}>1 Hour</option>
                <option value={1}>1 Day</option>
                <option value={7}>1 Week</option>
                <option value={30}>1 Month</option>
                <option value={90}>3 Months</option>
                <option value={180}>6 Months</option>
                <option value={365}>1 Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Change (%)
              </label>
              <input
                type="number"
                value={priceChange}
                onChange={(e) => setPriceChange(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Current Position Stats */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Position</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-lg font-semibold text-gray-800">
                  ${position.totalValueUSD.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Fees Earned</p>
                <p className="text-lg font-semibold text-green-600">
                  ${position.feesEarnedUSD.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">APR</p>
                <p className="text-lg font-semibold text-blue-600">
                  {position.apr.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${position.isInRange ? 'text-green-600' : 'text-yellow-600'}`}>
                  {position.isInRange ? 'In Range' : 'Out of Range'}
                </p>
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Projections</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Daily Fees</span>
                  <span className="font-semibold text-green-600">
                    ${projections.dailyFees < 0.01 ? `<0.01` : projections.dailyFees.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Projected Fees ({timeframe < 1 ? `${(timeframe * 24).toFixed(0)}h` : `${timeframe}d`})</span>
                  <span className="font-semibold text-green-600">
                    ${projections.projectedFees < 0.01 ? `<0.01` : projections.projectedFees.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">IL Adjustment</span>
                  <span className={`font-semibold ${projections.impermanentLossAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {projections.impermanentLossAdjustment > 0 ? '+' : ''}${projections.impermanentLossAdjustment.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                  {projections.totalReturn >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  ) : (
                     <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                    <span className="font-semibold text-gray-800">Total Return</span>
                  </div>
                  <p className={`text-2xl font-bold ${projections.totalReturn >= 0 ? 'text-blue-600' : 'text-red-600'} `}>
                    ${projections.totalReturn.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {projections.roi.toFixed(2)}% ROI
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">Final Value</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${projections.finalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scenarios */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Scenarios</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setPriceChange(-10)}
                className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium transition-colors"
              >
                Bear Market (-10%)
              </button>
              <button
                onClick={() => setPriceChange(0)}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Sideways (0%)
              </button>
              <button
                onClick={() => setPriceChange(10)}
                className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors"
              >
                Bull Market (+10%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};