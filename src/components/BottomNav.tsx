import React from 'react';
import { Home, ShoppingBag, Info, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function BottomNav() {
  const tabs = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'Products', href: '#products', icon: ShoppingBag },
    { name: 'About', href: '#about', icon: Info },
    { name: 'Contact', href: '#contact', icon: Mail },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 md:hidden z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => (
          <a
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
