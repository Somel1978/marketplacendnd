import React from 'react';
import { Search, Filter } from 'lucide-react';

interface MarketplaceSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    rarity: string[];
    priceRange: { min: number; max: number };
  };
  onFilterChange: (filters: any) => void;
}

export function MarketplaceSearch({ 
  searchTerm, 
  onSearchChange,
  filters,
  onFilterChange
}: MarketplaceSearchProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const handleRarityChange = (rarity: string) => {
    const updatedRarities = filters.rarity.includes(rarity)
      ? filters.rarity.filter(r => r !== rarity)
      : [...filters.rarity, rarity];
    onFilterChange({ ...filters, rarity: updatedRarities });
  };

  const handlePriceChange = (key: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    onFilterChange({
      ...filters,
      priceRange: { ...filters.priceRange, [key]: numValue }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for magical items..."
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="absolute right-3 top-3.5 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Rarity</h3>
              <div className="space-y-2">
                {['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'].map(rarity => (
                  <label key={rarity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.rarity.includes(rarity)}
                      onChange={() => handleRarityChange(rarity)}
                      className="rounded text-blue-500"
                    />
                    <span className="ml-2">{rarity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm">Minimum</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm">Maximum</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}