import React, { useState } from 'react';
import { FilterOptions } from '../../types';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import { Destination } from '../../types';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  destinations: Destination[];
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const editDistance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
};

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, destinations }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  
  const normalQuery = normalize(searchQuery);
  const hasSearchMatch = destinations.some(destination =>
    `${destination.name} ${destination.country} ${destination.description}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const suggestion = normalQuery.length >= 4 && !hasSearchMatch
    ? destinations.map(destination => {
        const name = normalize(destination.name);
        const queryWords = normalQuery.split(/\s+/);
        const nameWords = name.split(/\s+/);
        const wordScore = queryWords.map(word => Math.max(...nameWords.map(candidate => 1 - editDistance(word, candidate) / Math.max(word.length, candidate.length))));
        const score = wordScore.reduce((sum, value) => sum + value, 0) / wordScore.length;
        return { destination, score };
      }).filter(item => item.score >= 0.78)
        .sort((a, b) => b.score - a.score)[0]?.destination
    : undefined;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ ...filters, searchQuery: value });
  };
  
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  const handlePriceRangeChange = (level: number) => {
    let priceRange = [...(filters.priceRange || [])];
    
    if (priceRange.includes(level)) {
      priceRange = priceRange.filter(price => price !== level);
    } else {
      priceRange.push(level);
    }
    
    handleFilterChange('priceRange', priceRange);
  };
  
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilterChange({});
  };
  
  // Determine if any filter is active
  const hasActiveFilters = searchQuery || (filters.priceRange && filters.priceRange.length > 0) || filters.minPrice !== undefined || filters.maxPrice !== undefined;
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-8">
      <div className="p-4 border-b">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Filter size={18} className={`text-gray-500 ${showFilters ? 'text-teal-600' : ''}`} />
          </button>
        </div>
        {suggestion && (
          <p className="mt-2 text-sm text-gray-600">
            Mungkin yang Anda maksud adalah{' '}
            <button type="button" onClick={() => handleSearchChange({ target: { value: suggestion.name } } as React.ChangeEvent<HTMLInputElement>)} className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-900">
              {suggestion.name}
            </button>
          </p>
        )}
      </div>
      
      {showFilters && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="font-medium mb-2">Rentang harga (USD)</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['minPrice', 'maxPrice'] as const).map((key) => (
                  <label key={key} className="text-sm text-gray-600">
                    {key === 'minPrice' ? 'Harga minimum' : 'Harga maksimum'}
                    <input type="number" min="0" value={filters[key] ?? ''} placeholder="Tidak dibatasi"
                      onChange={e => handleFilterChange(key, e.target.value === '' ? undefined : Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="text"
              size="sm"
              onClick={clearFilters}
              className={`mr-2 ${!hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasActiveFilters}
              icon={<X size={16} />}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
