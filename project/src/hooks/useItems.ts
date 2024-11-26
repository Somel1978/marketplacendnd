import { useState, useEffect, useMemo } from 'react';
import { Item } from '../types/Item';
import { getAllItems } from '../services/api';
import { useDbStatus } from './useDbStatus';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 12;

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useDbStatus();

  const debouncedSearchTerm = useDebounce(searchTerm);

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedItems = await getAllItems();
      setItems(fetchedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [isConnected]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items;

    const searchValue = debouncedSearchTerm.toLowerCase();
    return items.filter(item => {
      const searchableFields: (keyof Item)[] = [
        'name', 'type', 'baseItem', 'rarity', 'source', 'requirements'
      ];
      
      return searchableFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchValue);
      });
    });
  }, [items, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return {
    items: paginatedItems,
    allItems: filteredItems, // For admin table view
    totalItems: filteredItems.length,
    currentPage,
    totalPages,
    setCurrentPage,
    setItems,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    refresh: loadItems
  };
}