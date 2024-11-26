import React from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Item } from '../types/Item';

interface ItemTableProps {
  items: Item[];
  sortConfig: {
    key: keyof Item | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export function ItemTable({ items, sortConfig, onSort, onEdit, onDelete }: ItemTableProps) {
  if (!items.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <p className="text-gray-500">No items available.</p>
      </div>
    );
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof Item }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const columns = Object.keys(items[0]).filter(key => key !== 'id') as (keyof Item)[];

  const formatValue = (key: keyof Item, value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    if (key === 'price') return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GP`;
    return String(value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{key}</span>
                    <SortIcon columnKey={key} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((key) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatValue(key, item[key])}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}