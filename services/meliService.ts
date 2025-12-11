import { Product } from '../types';

// Datos de prueba (Necesarios para que la app no marque error visualmente)
export const MELI_PRODUCTS: Product[] = [
  {
    id: 'MLM-2001',
    title: 'Apple MacBook Air M2 13.6" Space Gray',
    originalPrice: 22999,
    currentPrice: 22999,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=300&q=80',
    stock: 15,
    category: 'Computación',
    status: 'active',
    permalink: '#'
  },
  {
    id: 'MLM-2002',
    title: 'Monitor Gaming LG UltraGear 27"',
    originalPrice: 5499,
    currentPrice: 5499,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80',
    stock: 8,
    category: 'Computación',
    status: 'paused',
    permalink: '#'
  },
  {
    id: 'MLM-2003',
    title: 'PlayStation 5 Slim Edición Digital',
    originalPrice: 9499,
    currentPrice: 8999,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=300&q=80',
    stock: 22,
    category: 'Consolas',
    status: 'active',
    permalink: '#'
  },
  {
    id: 'MLM-2004',
    title: 'Drone DJI Mini 3 Pro con RC',
    originalPrice: 18500,
    currentPrice: 18500,
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=300&q=80',
    stock: 3,
    category: 'Cámaras',
    status: 'active',
    permalink: '#'
  }
];

export const meliService = {
  // 1. URL DE AUTORIZACIÓN REAL
  getAuthUrl: (): string => {
    const appId = "5395929759716110"; 
    // Use the current window origin as the redirect URI to return to the app
    const redirectUri = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'; 
    
    return `https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  // 2. FUNCIONES SIMULADAS (Mocking the backend token exchange)
  login: async (code?: string): Promise<{ user: string; token: string }> => {
    return new Promise((resolve) => {
      // In a real app, we would POST the code to our backend here
      setTimeout(() => {
        resolve({
          user: 'Usuario_MercadoLibre',
          token: `token-simulado-${code || 'demo'}`
        });
      }, 1500);
    });
  },

  fetchMyItems: async (token: string): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MELI_PRODUCTS);
      }, 1000);
    });
  },

  toggleItemStatus: async (productId: string, currentStatus: 'active' | 'paused'): Promise<'active' | 'paused'> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(currentStatus === 'active' ? 'paused' : 'active');
      }, 600);
    });
  }
};