import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Contact from './components/Contact';
import Products from './components/Products';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { Loader2 } from 'lucide-react';
import ProductDetail from './pages/ProductDetail';
import { supabase, SiteSettings } from './lib/supabaseClient';
import { siteSettings as fallbackSettings } from './lib/data';
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';

// Force dark mode permanently
document.documentElement.classList.add('dark');

function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        setSettings(data as SiteSettings);
      } catch (err) {
        console.warn('Could not load settings from Supabase, using defaults.', err);
        setSettings(fallbackSettings);
      } finally {
        setSettingsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Show a brief splash while settings load so hero/about/footer
  // don't flash with wrong content
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-grow pt-20">
        {activeTab === 'home' && (
          <>
            <Hero settings={settings} setActiveTab={setActiveTab} />
            <About settings={settings} />
            <Contact settings={settings} />
          </>
        )}
        {activeTab === 'products' && <Products />}
      </div>

      <Footer settings={settings} />
      <BackToTop />
      <Cart />
    </div>
  );
}


export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
