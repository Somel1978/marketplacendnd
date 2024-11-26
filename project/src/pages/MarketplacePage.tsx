import React, { useState, useMemo } from 'react';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/marketplace/ItemCard';
import { MarketplaceSearch } from '../components/marketplace/MarketplaceSearch';
import { Pagination } from '../components/Pagination';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function MarketplacePage() {
  const { 
    allItems, 
    currentPage,
    totalPages,
    setCurrentPage,
    searchTerm, 
    setSearchTerm, 
    isLoading, 
    error 
  } = useItems();

  const [filters, setFilters] = useState({
    rarity: [] as string[],
    priceRange: { min: 0, max: 100000 }
  });

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Rarity filter
      if (filters.rarity.length > 0 && !filters.rarity.includes(item.rarity)) {
        return false;
      }

      // Price filter
      if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [allItems, filters]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Loading items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarketplaceSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
      />
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalItems={filteredItems.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  );
}