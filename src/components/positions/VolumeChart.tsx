import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { PoolDayData } from '../../types';


interface VolumeChartProps {
  poolDayDatas: PoolDayData[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({
  poolDayDatas,
}) => {
  // Trier les données par date et prendre les 30 derniers jours
  const sortedData = [...poolDayDatas]
    .sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : b.date;
      return dateA - dateB;
    })
    .slice(-30);

  // Calculer les statistiques
  const maxVolume = Math.max(...sortedData.map(d => Number(d.volumeUSD)));
  const avgVolume = sortedData.reduce((sum, d) => sum + Number(d.volumeUSD), 0) / sortedData.length;
  const totalVolume = sortedData.reduce((sum, d) => sum + Number(d.volumeUSD), 0);

  // Formater les nombres
  const formatVolume = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Formater la date
  const formatDate = (dateValue: string | number) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Daily Volume</h3>
              <p className="text-gray-600">
                {token0Symbol}/{token1Symbol} Pool Activity
              </p>
            </div>
          </div> */}
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-500" />
             Pool Volume Activity
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {formatVolume(totalVolume)}
            </div>
            <div className="text-gray-500 text-sm">{sortedData.length}-day total</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Peak Volume</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatVolume(maxVolume)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Average Volume</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatVolume(avgVolume)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Days Tracked</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{sortedData.length}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {sortedData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No volume data available</p>
          </div>
        ) : (
          <div className="relative">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 h-64 pointer-events-none">
              {[0, 25, 50, 75, 100].map((percentage) => (
                <div
                  key={percentage}
                  className="absolute w-full border-t border-gray-100"
                  style={{ bottom: `${percentage}%` }}
                />
              ))}
            </div>

            {/* Chart Container */}
            <div className="flex items-end justify-between gap-1 h-64 mb-4">
              {sortedData.map((data, index) => {
                const height = (Number(data.volumeUSD) / maxVolume) * 100;
                const isHighest = Number(data.volumeUSD) === maxVolume;
                
                return (
                  <motion.div
                    key={data.date}
                    className="flex-1 group cursor-pointer relative z-10"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHighest
                          ? 'bg-gradient-to-t from-pink-400 to-purple-500'
                          : 'bg-gradient-to-t from-purple-400 to-slate-500'
                      } group-hover:from-purple-500 group-hover:to-pink-500`}
                      style={{ height: '100%' }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50">
                      <div className="font-semibold">{formatVolume(Number(data.volumeUSD))}</div>
                      <div className="text-gray-300">{formatDate(data.date)}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-xs text-gray-500">
              {sortedData.map((data, index) => {
                // Afficher seulement quelques labels pour éviter l'encombrement
                const showLabel = index % Math.ceil(sortedData.length / 6) === 0 || index === sortedData.length - 1;
                return (
                  <div key={data.date} className="flex-1 text-center">
                    {showLabel && formatDate(data.date)}
                  </div>
                );
              })}
            </div>

            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500 -ml-16">
              <div>{formatVolume(maxVolume)}</div>
              <div>{formatVolume(maxVolume * 0.75)}</div>
              <div>{formatVolume(maxVolume * 0.5)}</div>
              <div>{formatVolume(maxVolume * 0.25)}</div>
              <div>$0</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};