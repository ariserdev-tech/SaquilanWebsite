import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';
import { Product } from '@/src/lib/supabaseClient';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row h-full group"
      >
        <div 
          className="relative w-full md:w-2/5 aspect-[16/10] overflow-hidden cursor-zoom-in"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-2 bg-white/90 rounded-full text-primary">
              <Maximize2 size={18} />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow md:w-3/5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-display">
              {product.category}
            </span>
            <span className="text-lg font-bold text-primary dark:text-blue-400 font-display">
              ₱{product.price_php.toLocaleString()}
            </span>
          </div>
          
          <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors font-display">
            {product.name}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
            {product.description}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
              isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {isOutOfStock ? 'OUT OF STOCK' : 'AVAILABLE'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-[16/10] bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-3xl font-bold font-display mb-2">{product.name}</h2>
                <p className="text-lg opacity-90">{product.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
