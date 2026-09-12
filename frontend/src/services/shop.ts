import apiClient from './api';
import type { ShopData, PurchaseResult, ApiSuccess } from '../types';

export const getShopItems = async (): Promise<ShopData> => {
  const { data } = await apiClient.get<ApiSuccess<ShopData>>('/shop/items');
  return data.data;
};

export const purchaseShopItem = async (itemId: string): Promise<PurchaseResult> => {
  const { data } = await apiClient.post<ApiSuccess<PurchaseResult>>(`/shop/items/${itemId}/purchase`);
  return data.data;
};
