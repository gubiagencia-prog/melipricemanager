export interface Product {
  id: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  stock: number;
  category: string;
  status: 'active' | 'paused';
  permalink?: string;
}

export type AdjustmentType = 'percentage' | 'fixed';

export interface PriceSchedule {
  id: string;
  productId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  type: AdjustmentType;
  value: number; // e.g. 20 for 20% or 200 for $200
  isActive: boolean;
  status: 'pending' | 'active' | 'completed' | 'expired';
}

export interface AISuggestion {
  reasoning: string;
  suggestedType: AdjustmentType;
  suggestedValue: number;
  suggestedDurationHours: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}