import React, { useState } from 'react';
import { TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react';
import { ChartData } from '../types';

interface ChartProps {
  data: ChartData[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'totalValue' | 'feesEarned' | 'positions'>('totalValue');

  const maxValue = Math.max(...data.map(d => d[activeMetric]));
  const minValue = Math.min(...data.map(d => d[activeMetric]));

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'totalValue': return 'stroke-blue-500 fill-blue-500';
      case 'feesEarned': return 'stroke-green-500 fill-green-500';
      case 'positions': return 'stroke-purple-500 fill-purple-500';
      default: return 'stroke-blue-500 fill-blue-500';
    }
  };

  // const getMetricIcon = () => {
  //   switch (activeMetric) {
  //     case 'totalValue': return <DollarSign className="w-5 h-5" />;
  //     case 'feesEarned': return <TrendingUp className="w-5 h-5" />;
  //     case 'positions': return <Activity className="w-5 h-5" />;
  //     default: return <DollarSign className="w-5 h-5" />;
  //   }
  // };

  // const getMetricLabel = () => {
  //   switch (activeMetric) {
  //     case 'totalValue': return 'Total Value';
  //     case 'feesEarned': return 'Fees Earned';
  //     case 'positions': return 'Positions';
  //     default: return 'Total Value';
  //   }
  // };

  const normalizeValue = (value: number) => {
    return ((value - minValue) / (maxValue - minValue)) * 200;
  };

  const formatValue = (value: number) => {
    if (activeMetric === 'positions') return value.toString();
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Performance Overview</h3>
            <p className="text-gray-600">Track your portfolio performance over time</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMetric('totalValue')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeMetric === 'totalValue'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Value</span>
          </button>
          
          <button
            onClick={() => setActiveMetric('feesEarned')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeMetric === 'feesEarned'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Fees</span>
          </button>
          
          <button
            onClick={() => setActiveMetric('positions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeMetric === 'positions'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Positions</span>
          </button>
        </div>
      </div>

      <div className="relative h-80">
        <svg width="100%" height="100%" viewBox="0 0 800 250" className="overflow-visible">
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart Area */}
          <g transform="translate(40, 20)">
            {/* Line Chart */}
            <path
              d={`M ${data.map((point, index) => 
                `${(index * 720) / (data.length - 1)},${210 - normalizeValue(point[activeMetric])}`
              ).join(' L ')}`}
              fill="none"
              className={`${getMetricColor()} stroke-2`}
            />
            
            {/* Area Fill */}
            <path
              d={`M ${data.map((point, index) => 
                `${(index * 720) / (data.length - 1)},${210 - normalizeValue(point[activeMetric])}`
              ).join(' L ')} L 720,210 L 0,210 Z`}
              className={`${getMetricColor()} fill-opacity-20`}
            />
            
            {/* Data Points */}
            {data.map((point, index) => {
              const x = (index * 720) / (data.length - 1);
              const y = 210 - normalizeValue(point[activeMetric]);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className={`${getMetricColor()} stroke-2 fill-white`}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    className="fill-transparent cursor-pointer hover:fill-black hover:fill-opacity-10"
                  />
                </g>
              );
            })}
          </g>
          
          {/* Y-axis Labels */}
          <g transform="translate(0, 20)">
            <text x="30" y="15" className="text-xs fill-gray-500 text-end" textAnchor="end">
              {formatValue(maxValue)}
            </text>
            <text x="30" y="110" className="text-xs fill-gray-500 text-end" textAnchor="end">
              {formatValue((maxValue + minValue) / 2)}
            </text>
            <text x="30" y="215" className="text-xs fill-gray-500 text-end" textAnchor="end">
              {formatValue(minValue)}
            </text>
          </g>
          
          {/* X-axis Labels */}
          <g transform="translate(40, 240)">
            <text x="0" y="15" className="text-xs fill-gray-500" textAnchor="start">
              {new Date(data[0].date).toLocaleDateString()}
            </text>
            <text x="360" y="15" className="text-xs fill-gray-500" textAnchor="middle">
              {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString()}
            </text>
            <text x="720" y="15" className="text-xs fill-gray-500" textAnchor="end">
              {new Date(data[data.length - 1].date).toLocaleDateString()}
            </text>
          </g>
        </svg>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ${data[data.length - 1].totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600">
            {((data[data.length - 1].totalValue / data[0].totalValue - 1) * 100).toFixed(1)}% change
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Fees</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${data[data.length - 1].feesEarned.toLocaleString()}
          </p>
          <p className="text-sm text-green-600">
            +${(data[data.length - 1].feesEarned - data[0].feesEarned).toLocaleString()} earned
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Active Positions</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {data[data.length - 1].positions}
          </p>
          <p className="text-sm text-purple-600">
            {data[data.length - 1].positions === data[0].positions ? 'No change' : 
             `${data[data.length - 1].positions > data[0].positions ? '+' : ''}${data[data.length - 1].positions - data[0].positions} positions`}
          </p>
        </div>
      </div>
    </div>
  );
};