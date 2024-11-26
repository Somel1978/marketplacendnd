import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export function SearchBar({ searchTerm, onSearchChange, onRefresh }: SearchBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <div className="mb-6 flex justify-between">
      <div className="relative flex-1 max-w-lg">
        <input
          type="text"
          placeholder="Search items..."
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="absolute right-3 top-2.5 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>
      <button 
        onClick={onRefresh}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
}