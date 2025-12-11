import React from 'react';
import { Product } from '../types';
import { Tag, Clock, Power, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isActiveSale: boolean;
  onToggleStatus: (product: Product) => void;
  isProcessing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  isActiveSale, 
  onToggleStatus,
  isProcessing = false 
}) => {
  const discount = product.originalPrice > product.currentPrice
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : 0;
  
  const isPaused = product.status === 'paused';

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md ${isActiveSale ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'} ${isPaused ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="relative h-48 overflow-hidden rounded-t-xl group bg-gray-50">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2 flex gap-1">
            {isPaused ? (
                <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center">
                    PAUSADA
                </span>
            ) : (
                discount > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      {discount}% OFF
                    </div>
                )
            )}
        </div>

        {/* Active Sale Badge */}
        {isActiveSale && !isPaused && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
            <Clock className="w-3 h-3 mr-1" />
            OFERTA
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
            <div className="text-xs text-slate-500">{product.category}</div>
            <a href="#" className="text-slate-400 hover:text-blue-500" title="Ver en Mercado Libre">
                <ExternalLink className="w-3 h-3" />
            </a>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 h-10 mb-2" title={product.title}>
          {product.title}
        </h3>
        
        <div className="flex items-end justify-between mb-4">
          <div>
            {isActiveSale && !isPaused && (
              <span className="text-xs text-slate-400 line-through block">
                ${product.originalPrice.toLocaleString('es-MX')}
              </span>
            )}
            <div className={`text-xl font-bold ${isActiveSale && !isPaused ? 'text-green-600' : 'text-slate-800'}`}>
              ${product.currentPrice.toLocaleString('es-MX')}
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-slate-500">Stock: {product.stock}</div>
             <div className={`text-xs font-medium ${isPaused ? 'text-slate-500' : 'text-green-600'}`}>
                {product.status === 'active' ? 'Activa' : 'Pausada'}
             </div>
          </div>
        </div>

        <div className="flex gap-2">
            <button 
            onClick={() => onSelect(product)}
            disabled={isPaused}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent
                ${isPaused 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800'}`}
            >
            <Tag className="w-4 h-4" />
            Programar
            </button>
            
            <button 
                onClick={() => onToggleStatus(product)}
                disabled={isProcessing}
                title={isPaused ? "Reactivar publicación" : "Pausar publicación"}
                className={`w-10 flex items-center justify-center rounded-lg border transition-colors
                    ${isPaused 
                        ? 'bg-white border-slate-300 text-slate-600 hover:bg-green-50 hover:text-green-600 hover:border-green-300' 
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200'}
                `}
            >
                <Power className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
            </button>
        </div>
      </div>
    </div>
  );
};