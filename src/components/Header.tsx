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
        </button>

        {/* Navigation Tabs (Desktop & Mobile) */}
        <nav className="flex items-center gap-3 md:gap-8 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const handleNavClick = () => {
              if (link.id === 'about' || link.id === 'contact') {
                if (activeTab !== 'home') {
                  setActiveTab('home');
                  // Give React a tick to render Home
                  setTimeout(() => {
                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                }
              } else {
                setActiveTab(link.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            };

            const isActive = activeTab === link.id || (activeTab === 'home' && (link.id === 'about' || link.id === 'contact') ? false : false);

            return (
              <button
                key={link.id}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  isActive
                    ? "text-accent border-b-2 border-accent pb-1 md:pb-0 md:border-b-0"
                    : "text-slate-400 hover:text-accent"
                )}
              >
                <link.icon className="md:hidden" size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "md:block",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {link.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
