import React from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder: string;
}

interface FilterBarProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterConfigs,
  onFilterChange,
  onSearch,
  searchQuery = '',
  onClearFilters
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:items-center lg:gap-4">
        {/* Filter Dropdowns - Stack on mobile, grid on tablet, row on desktop */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:gap-4">
          {filterConfigs.map((config) => (
            <div key={config.key} className="relative min-w-0 lg:min-w-[160px]">
              <select
                value={filters[config.key] || ''}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{config.placeholder}</option>
                {config.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Search Bar and Buttons */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-1">
          {/* Search Bar */}
          {onSearch && (
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search papers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Clear Filters Button */}
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear All
            </button>

            {/* Search Button - Hidden on mobile since we have live search */}
            <button className="hidden sm:flex px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors items-center space-x-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
