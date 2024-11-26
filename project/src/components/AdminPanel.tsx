import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Item } from '../types/Item';
import { SearchBar } from './SearchBar';
import { ItemTable } from './ItemTable';
import { ItemForm } from './ItemForm';
import { createItem, updateItem, deleteItem } from '../services/api';

interface AdminPanelProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AdminPanel({ items, onItemsChange, onRefresh, isLoading = false, error = null }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Item | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSort = (key: keyof Item) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedItems = [...items].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    onItemsChange(sortedItems);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsAddingItem(false);
    setSaveError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteItem(id);
      onItemsChange(items.filter(item => item.id !== id));
      onRefresh(); // Refresh the list after deletion
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleSubmit = async (formData: Partial<Item>) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (editingItem) {
        const updatedItem = await updateItem(editingItem.id, formData);
        onItemsChange(items.map(i => i.id === editingItem.id ? updatedItem : i));
        setEditingItem(null);
      } else {
        const newItem = await createItem(formData);
        onItemsChange([newItem, ...items]);
      }
      
      setIsAddingItem(false);
      onRefresh(); // Refresh the list to ensure we have the latest data
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    const searchValue = searchTerm.toLowerCase();
    const searchableFields: (keyof Item)[] = [
      'name', 'type', 'baseItem', 'rarity', 'source', 'requirements'
    ];
    
    return searchableFields.some(field => {
      const value = item[field];
      return value != null && String(value).toLowerCase().includes(searchValue);
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Loading items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-red-500">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={onRefresh}
        />
        <button
          onClick={() => {
            setIsAddingItem(true);
            setEditingItem(null);
            setSaveError(null);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {(isAddingItem || editingItem) && (
        <div className="relative">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{saveError}</span>
            </div>
          )}
          
          {isSaving && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
          
          <ItemForm
            item={editingItem || {}}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingItem(null);
              setIsAddingItem(false);
              setSaveError(null);
            }}
          />
        </div>
      )}

      <ItemTable
        items={filteredItems}
        sortConfig={sortConfig}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}