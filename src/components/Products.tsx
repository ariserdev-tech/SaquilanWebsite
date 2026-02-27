import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/src/lib/supabaseClient';
import ProductCard from './ProductCard';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    image_url: 'https://picsum.photos/seed/audio/600/600',
    price_php: 4999,
    category: 'Electronics',
    stock_status: 'available',
    description: 'High-fidelity audio with noise cancellation.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Minimalist Leather Wallet',
    image_url: 'https://picsum.photos/seed/wallet/600/600',
    price_php: 1250,
    category: 'Accessories',
    stock_status: 'available',
    description: 'Genuine leather, slim design.',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    image_url: 'https://picsum.photos/seed/watch/600/600',
    price_php: 3499,
    category: 'Electronics',
    stock_status: 'out_of_stock',
    description: 'Track your health and workouts.',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Organic Cotton T-Shirt',
    image_url: 'https://picsum.photos/seed/shirt/600/600',
    price_php: 850,
    category: 'Clothing',
    stock_status: 'available',
    description: 'Soft, breathable, and eco-friendly.',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    image_url: 'https://picsum.photos/seed/keyboard/600/600',
    price_php: 5200,
    category: 'Electronics',
    stock_status: 'available',
    description: 'Tactile switches for ultimate typing.',
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Canvas Backpack',
    image_url: 'https://picsum.photos/seed/bag/600/600',
    price_php: 2100,
    category: 'Accessories',
    stock_status: 'available',
    description: 'Durable and stylish for daily use.',
    created_at: new Date().toISOString(),
  },
];

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Accessories'];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Carousel Logic
  useEffect(() => {
    if (isPaused || activeCategory !== 'All' || searchQuery !== '') return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, offsetWidth, scrollWidth } = carouselRef.current;
        const nextScroll = scrollLeft + offsetWidth;
        
        if (nextScroll >= scrollWidth) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, activeCategory, searchQuery]);

  return (
    <section id="products" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Our Featured <span className="text-accent">Products</span>
          </motion.h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our wide range of premium products. From electronics to fashion, we have everything you need to upgrade your lifestyle.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Desktop Carousel / Mobile Grid */}
        <div className="relative group overflow-visible">
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 md:pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] md:min-w-[350px] snap-center px-2">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full py-20 text-center text-slate-500">
                No merchandises found matching your criteria.
              </div>
            )}
          </div>
          
          {/* Carousel Controls (Desktop Only) */}
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
