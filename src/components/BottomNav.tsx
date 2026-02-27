import React from 'react';
import { Home, ShoppingBag, Info, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { name: 'Home', id: 'home', icon: Home },
    { name: 'Products', id: 'products', icon: ShoppingBag },
    { name: 'About', id: 'about', icon: Info },
    { name: 'Contact', id: 'contact', icon: Mail },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === tab.id 
                ? "text-accent scale-110" 
                : "text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              activeTab === tab.id ? "opacity-100" : "opacity-70"
            )}>
              {tab.name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
