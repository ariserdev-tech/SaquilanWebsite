import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../lib/supabaseClient';

interface HeroProps {
  settings: SiteSettings | null;
  setActiveTab: (tab: string) => void;
}

export default function Hero({ settings, setActiveTab }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -mr-64 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent dark:text-accent text-sm font-bold mb-6 border border-accent/20"
          >
            📍 Badtasan, Kiamba, Sarangani Province
          </motion.span>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-slate-900 dark:text-white">
            {settings?.motto || 'Premium Merchandises for Every Store & Customer.'}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
            SaquilanMerchandise provides high-quality products tailored for both wholesale stores and individual customers. We bring excellence right to your doorstep in Sarangani.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={() => setActiveTab('products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-slate-900 dark:bg-accent text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 dark:shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <ShoppingCart size={20} />
              Shop Now
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-primary dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle size={20} />
              Contact Us
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 aspect-[8/10]">
            <img
              src={settings?.hero_image_url || "https://picsum.photos/seed/ecommerce/800/1000"}
              alt="Hero Product"
              loading="lazy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
