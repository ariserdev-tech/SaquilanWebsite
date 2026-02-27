import React, { useState, useEffect } from 'react';
import { Sun, Moon, ShoppingBag, Info, Mail, Store, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ isDarkMode, toggleDarkMode, activeTab, setActiveTab }: HeaderProps) {
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
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-200/50 dark:border-slate-800/50' 
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Store size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-none font-display">
            SAQUILAN<br/><span className="text-accent">MERCHANDISE</span>
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
                activeTab === link.id ? "text-accent border-b-2 border-accent pb-1" : "text-slate-600 dark:text-slate-400"
              )}
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 ml-4 text-slate-700 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            to="/admin"
            className="ml-4 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <User size={16} />
            Login
          </Link>
        </nav>

        {/* Mobile Theme Toggle & Login */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            to="/admin"
            className="p-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            aria-label="Admin Login"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
