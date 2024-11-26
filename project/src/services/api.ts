import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { DbConfig } from '../config/database';
import type { Item } from '../types/Item';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export async function testConnection(config: DbConfig): Promise<void> {
  try {
    const { data } = await api.post('/db/test', config);
    if (!data.message) {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
}

export async function getAllItems(): Promise<Item[]> {
  try {
    const { data } = await api.get<Item[]>('/items');
    return data;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}

export async function createItem(item: Partial<Item>): Promise<Item> {
  try {
    console.log('Creating item with data:', item);

    const { data } = await api.post<Item>('/items', {
      type: item.type || '',
      name: item.name || '',
      price: item.price || 0,
      baseItem: item.baseItem || '',
      rarity: item.rarity || 'Common',
      attunement: item.attunement || null,
      requirements: item.requirements || null,
      weight: item.weight || 0,
      source: item.source || '',
      image: item.image || null,
      link: item.link || null
    });

    if (!data || !data.id) {
      throw new Error('Invalid response from server');
    }

    console.log('Item created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
}

export async function updateItem(id: number, item: Partial<Item>): Promise<Item> {
  try {
    console.log('Updating item:', id, 'with data:', item);

    const { data } = await api.put<Item>(`/items/${id}`, item);
    
    if (!data || !data.id) {
      throw new Error('Invalid response from server');
    }

    console.log('Item updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
}

export async function deleteItem(id: number): Promise<boolean> {
  try {
    console.log('Deleting item:', id);
    await api.delete(`/items/${id}`);
    console.log('Item deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete item:', error);
    return false;
  }
}