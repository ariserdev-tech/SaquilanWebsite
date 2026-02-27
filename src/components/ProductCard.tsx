import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/src/lib/supabaseClient';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden group">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors">
            <Eye size={20} />
          </button>
          {!isOutOfStock && (
            <button className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors">
              <ShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">
            {product.category}
          </span>
          <span className="text-lg font-bold text-primary dark:text-blue-400">
            ₱{product.price_php.toLocaleString()}
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {product.description}
        </p>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
          <button className="text-primary font-bold text-sm hover:text-accent transition-colors flex items-center gap-1">
            View Details <Eye size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
