import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Product, Category } from '@/src/lib/supabaseClient';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: catData } = await supabase.from('categories').select('*').order('name');

      if (prodData) setProducts(prodData);
      if (catData) setCategories(catData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
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
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === 'All'
                ? 'bg-slate-900 dark:bg-accent text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat.name
                  ? 'bg-slate-900 dark:bg-accent text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {cat.name}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-medium">Loading merchandises...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-500">
              No merchandises found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
