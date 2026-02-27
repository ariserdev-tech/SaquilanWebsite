import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Store } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <Store size={18} />
            </div>
            <span className="text-xl font-black tracking-tighter">
              SAQUILAN<span className="text-accent">MERCHANDISE</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
            Premium merchandises tailored for stores and individual customers in Kiamba. Quality products, local service, and fast delivery across Sarangani Province.
          </p>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {currentYear} SaquilanMerchandise. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
