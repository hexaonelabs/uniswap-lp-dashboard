import React from 'react';
import { Filter, TrendingUp, TrendingDown, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { PositionsFilterOptions } from '../../types';
import { Network } from '../../services/fetcher';

interface PositionsFiltersProps {
  filters: PositionsFilterOptions;
  onFiltersChange: (filters: PositionsFilterOptions) => void;
  chains: Network[];
}

export const PositionsFilters: React.FC<PositionsFiltersProps> = ({ filters, onFiltersChange, chains }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof PositionsFilterOptions, value: any) => {
    const range = key === 'status' && value === 'closed' ? 'all' : filters.range;
    onFiltersChange({ ...filters, range, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filters & Sorting</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Positions</option>
            <option value="open">Open Only</option>
            <option value="closed">Closed Only</option>
          </select>
        </div>

        {/* Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Range</label>
          <select
            value={filters.range}
            onChange={(e) => handleFilterChange('range', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Positions</option>
            <option value="in">In Range Only</option>
            <option value="out">Out of Range Only</option>
          </select>
        </div>

        {/* Chain Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chain</label>
          <select
            value={filters.chain}
            onChange={(e) => handleFilterChange('chain', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Chains</option>
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="value">Total Value</option>
            <option value="fees">Fees Earned</option>
            <option value="apr">APR</option>
            <option value="created">Created Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => handleFilterChange('status', 'open')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.status === 'open'
              ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Open Positions</span>
        </button>

        <button
          onClick={() => handleFilterChange('status', 'closed')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.status === 'closed'
              ? 'bg-red-100 text-red-700 border-2 border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Closed Positions</span>
        </button>

        <button
          onClick={() => handleFilterChange('range', 'in')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.range === 'in'
              ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>In Range</span>
        </button>
        <button
          onClick={() => handleFilterChange('range', 'out')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.range === 'out'
              ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Out of Range</span>
        </button>

        <button
          onClick={() => handleFilterChange('sortBy', 'value')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.sortBy === 'value'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>By Value</span>
        </button>

        <button
          onClick={() => handleFilterChange('sortBy', 'created')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filters.sortBy === 'created'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>By Date</span>
        </button>
      </div>
    </div>
  );
};