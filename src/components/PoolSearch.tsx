import React, { useState } from 'react';
import { Search, TrendingUp, ExternalLink, Star } from 'lucide-react';
import { Pool } from '../types';

interface PoolSearchProps {
  pools: Pool[];
}

export const PoolSearch: React.FC<PoolSearchProps> = ({ pools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'apr' | 'tvl' | 'volume'>('apr');
  const [selectedChain, setSelectedChain] = useState('all');

  const filteredPools = pools
    .filter(pool => {
      const matchesSearch = 
        pool.token0.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.token1.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesChain = selectedChain === 'all' || pool.chain.id.toString() === selectedChain;
      
      return matchesSearch && matchesChain;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'apr': return b.apr - a.apr;
        case 'tvl': return b.tvlUSD - a.tvlUSD;
        case 'volume': return b.volumeUSD24h - a.volumeUSD24h;
        default: return 0;
      }
    });

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Search className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Best Pool Rewards</h3>
          <p className="text-gray-600">Find the highest yielding pools across networks</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pools (e.g., USDC, ETH)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Chains</option>
          <option value="1">Ethereum</option>
          <option value="137">Polygon</option>
          <option value="42161">Arbitrum</option>
          <option value="10">Optimism</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'apr' | 'tvl' | 'volume')}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="apr">Highest APR</option>
          <option value="tvl">Highest TVL</option>
          <option value="volume">Highest Volume</option>
        </select>
      </div>

      {/* Pool List */}
      <div className="space-y-4">
        {filteredPools.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No pools found matching your criteria</p>
          </div>
        ) : (
          filteredPools.map((pool) => (
            <div key={pool.address} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={pool.token0.logoURI} 
                      alt={pool.token0.symbol}
                      className="w-10 h-10 rounded-full"
                    />
                    <img 
                      src={pool.token1.logoURI} 
                      alt={pool.token1.symbol}
                      className="w-10 h-10 rounded-full -ml-2"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{pool.feeTier / 10000}% Fee</span>
                      <span>•</span>
                      <img src={pool.chain.logoURI} alt={pool.chain.name} className="w-4 h-4" />
                      <span>{pool.chain.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xl font-bold text-green-600">{pool.apr.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">APR</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>TVL: {formatLargeNumber(pool.tvlUSD)}</span>
                    <span>Vol: {formatLargeNumber(pool.volumeUSD24h)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>24h Fees: {formatLargeNumber(pool.feesUSD24h)}</span>
                  <span>Liquidity: {formatLargeNumber(parseInt(pool.liquidity))}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Add Position</span>
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};