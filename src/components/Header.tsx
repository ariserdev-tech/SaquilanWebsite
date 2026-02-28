import React, { useState, useEffect } from 'react';
import { ShoppingBag, Info, Mail, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home', icon: Info },
    { name: 'Products', id: 'products', icon: ShoppingBag },
    { name: 'About', id: 'about', icon: Info },
    { name: 'Contact', id: 'contact', icon: Mail },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        isScrolled
          ? 'bg-slate-900/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-800/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
            <Store size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-white leading-none font-display">
            SAQUILAN<br /><span className="text-accent">MERCHANDISE</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-all hover:text-accent",
                activeTab === link.id ? "text-accent border-b-2 border-accent pb-1" : "text-slate-400"
              )}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Mobile — nothing extra needed since BottomNav handles mobile navigation */}
      </div>
    </header>
  );
}
