import apiClient from './api';
import type { InventoryItem, ApiSuccess } from '../types';

export const getUserInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await apiClient.get<ApiSuccess<InventoryItem[]>>('/inventory');
  return data.data;
};

export const equipItem = async (itemId: string): Promise<InventoryItem> => {
  const { data } = await apiClient.post<ApiSuccess<InventoryItem>>(`/inventory/${itemId}/equip`);
  return data.data;
};

export const unequipItem = async (itemId: string): Promise<InventoryItem> => {
  const { data } = await apiClient.post<ApiSuccess<InventoryItem>>(`/inventory/${itemId}/unequip`);
  return data.data;
};
