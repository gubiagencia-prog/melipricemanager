import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'MLM-1001',
    title: 'Sony WH-1000XM5 Auriculares Inalámbricos',
    originalPrice: 6500,
    currentPrice: 6500,
    image: 'https://picsum.photos/id/1/300/300',
    stock: 12,
    category: 'Electrónica',
    status: 'active'
  },
  {
    id: 'MLM-1002',
    title: 'Samsung Galaxy S23 Ultra 512GB',
    originalPrice: 25999,
    currentPrice: 25999,
    image: 'https://picsum.photos/id/2/300/300',
    stock: 5,
    category: 'Celulares',
    status: 'active'
  },
  {
    id: 'MLM-1003',
    title: 'Tenis Nike Air Force 1 Blancos',
    originalPrice: 2100,
    currentPrice: 2100,
    image: 'https://picsum.photos/id/3/300/300',
    stock: 45,
    category: 'Moda',
    status: 'paused'
  },
  {
    id: 'MLM-1004',
    title: 'Nintendo Switch OLED Neon',
    originalPrice: 7200,
    currentPrice: 7200,
    image: 'https://picsum.photos/id/4/300/300',
    stock: 8,
    category: 'Videojuegos',
    status: 'active'
  },
  {
    id: 'MLM-1005',
    title: 'Cafetera Nespresso Essenza Mini',
    originalPrice: 1800,
    currentPrice: 1800,
    image: 'https://picsum.photos/id/5/300/300',
    stock: 20,
    category: 'Hogar',
    status: 'active'
  }
];