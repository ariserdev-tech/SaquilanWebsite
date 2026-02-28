import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Maximize2 } from 'lucide-react';
import { Product } from '@/src/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const navigate = useNavigate();

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-700 flex flex-row h-full group"
      >
        <div
          className="relative w-2/5 flex-shrink-0 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 20M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <img
            src={product.image_url}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />

          {isOutOfStock && imageLoaded && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          {imageLoaded && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-2 bg-white/90 rounded-full text-slate-900">
                <Maximize2 size={18} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow min-w-0">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest font-display truncate">
              {product.category}
            </span>
            <span className="text-sm font-bold text-primary font-display flex-shrink-0">
              ₱{product.price_php.toLocaleString()}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-accent transition-colors font-display">
            {product.name}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
            {product.description}
          </p>

          <div className="pt-2 border-t border-slate-700 flex items-center">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock
              ? 'bg-red-900/30 text-red-400'
              : 'bg-green-900/30 text-green-400'
              }`}>
              {isOutOfStock ? 'OUT OF STOCK' : 'AVAILABLE'}
            </span>
          </div>
        </div>
      </motion.div>

    </>
  );
}
