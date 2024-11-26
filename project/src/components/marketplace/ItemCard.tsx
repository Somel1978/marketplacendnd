import React from 'react';
import { Item } from '../../types/Item';
import { Shield, ExternalLink, Info } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-800';
      case 'Uncommon': return 'bg-green-100 text-green-800';
      case 'Rare': return 'bg-blue-100 text-blue-800';
      case 'Very Rare': return 'bg-purple-100 text-purple-800';
      case 'Legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('pt-PT', { minimumFractionDigits: Math.ceil(price % 1) * 2 })} GP`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {item.image && (
        <div className="w-[200px] h-[200px] mx-auto overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/200x200?text=No+Image';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                  title="View details"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{item.type}</p>
          </div>
          <div className="ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
              {item.rarity}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Base Item:</span>
            <p className="font-medium text-gray-900">{item.baseItem}</p>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
          </div>
          {item.weight && (
            <div>
              <span className="text-gray-500">Weight:</span>
              <p className="font-medium text-gray-900">{item.weight} lbs</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Source:</span>
            <p className="font-medium text-gray-900">{item.source}</p>
          </div>
        </div>

        {item.attunement && (
          <div className="mt-4 flex items-center space-x-1 text-purple-600">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Requires Attunement</span>
          </div>
        )}

        {item.requirements && (
          <div className="mt-4">
            <div className="flex items-center space-x-1 text-gray-500 mb-1">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Requirements</span>
            </div>
            <p className="text-sm text-gray-700">{item.requirements}</p>
          </div>
        )}
      </div>
    </div>
  );
}