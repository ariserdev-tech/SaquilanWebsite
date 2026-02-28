import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Contact from './components/Contact';
import Products from './components/Products';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Admin from './pages/Admin';
import { supabase, SiteSettings } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import ProductDetail from './pages/ProductDetail';

// Force dark mode permanently
document.documentElement.classList.add('dark');

function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').single();
        if (data) setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-accent" size={48} />
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
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Admin />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />      </Routes>
    </Router>
  );
}
