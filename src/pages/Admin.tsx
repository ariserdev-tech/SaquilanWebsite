import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, Package, Settings as SettingsIcon, LogOut, Upload, MapPin, Image as ImageIcon, Store, Loader2, Mail, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase, Product, SiteSettings, Category } from '@/src/lib/supabaseClient';
import { cn } from '@/src/lib/utils';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'merchandise' | 'categories' | 'settings'>('merchandise');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price_php: 0, category: '', description: '', stock_status: 'available', image_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, setRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('settings').select('*').single()
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (setRes.data) setSettings(setRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message || 'Error signing in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Image Management
  const uploadImage = async (file: File, bucket: string = 'SaquilanWebsite') => {
    setUploadingImage(true);
    try {
      // Ensure file exists and is valid
      if (!file) throw new Error('No file selected');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Could not get public URL for uploaded file');

      return publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImage:', error);
      alert(error.message || 'Error uploading image. Please ensure the storage bucket exists and has correct permissions.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteImage = async (url: string, bucket: string = 'merchandise') => {
    if (!url) return;
    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from(bucket).remove([fileName]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Product Actions
  const handleSaveProduct = async () => {
    const data = { ...productForm };
    if (editingProduct) {
      if (editingProduct.image_url !== data.image_url) {
        await deleteImage(editingProduct.image_url, 'SaquilanWebsite');
      }
      const { error } = await supabase.from('products').update(data).eq('id', editingProduct.id);
      if (!error) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } as Product : p));
        setEditingProduct(null);
      }
    } else {
      const { data: newProd, error } = await supabase.from('products').insert([data]).select().single();
      if (!error && newProd) {
        setProducts([newProd, ...products]);
        setIsAddingProduct(false);
      }
    }
    setProductForm({ name: '', price_php: 0, category: '', description: '', stock_status: 'available', image_url: '' });
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm('Delete this merchandise?')) {
      await deleteImage(product.image_url, 'SaquilanWebsite');
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) setProducts(products.filter(p => p.id !== product.id));
    }
  };

  // Category Actions
  const [newCatName, setNewCatName] = useState('');
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCatName.trim() }])
        .select()
        .single();

      if (error) {
        console.error('Category add error:', error);
        throw new Error(error.message);
      }

      if (data) {
        setCategories(prev => [...prev, data]);
        setNewCatName('');
      }
    } catch (error: any) {
      alert(`Error adding category: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) setCategories(categories.filter(c => c.id !== id));
    }
  };

  // Settings Actions
  const handleSaveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from('settings').update(settings).eq('id', settings.id);
    if (!error) alert('Settings updated!');
  };

  // Draggable Marker for Map
  function DraggableMarker() {
    const markerRef = useRef<any>(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null && settings) {
            const pos = marker.getLatLng();
            setSettings({ ...settings, lat: pos.lat, lng: pos.lng });
          }
        },
      }),
      [],
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[settings?.lat || 5.9897, settings?.lng || 124.6311]}
        ref={markerRef}>
      </Marker>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-6">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 dark:border-slate-800/50">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-primary/40 rotate-3">
              <Store size={40} />
            </div>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-black tracking-tight font-display mb-3 text-white">Admin Hub</h1>
              <p className="text-slate-400 font-medium">SaquilanMerchandise Management Console</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="text-left group">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-[0.2em]">Credential ID (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@saquilan.com"
                      className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="text-left group">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-[0.2em]">Secure Key (Password)</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-6 py-5 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Access Console
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-8 text-slate-600 text-sm font-bold tracking-tight">
            Protected by Enterprise Grade Encryption
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Admin Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <Store size={24} />
            </div>
            <span className="text-lg font-black tracking-tighter hidden sm:block">ADMIN PANEL</span>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('merchandise')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'merchandise' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Merchandise
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'categories' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'settings' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"
              )}
            >
              Settings
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'merchandise' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold font-display">Manage Merchandises</h2>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus size={20} /> Add Item
              </button>
            </div>

            {(isAddingProduct || editingProduct) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 mb-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-display">{editingProduct ? 'Edit Item' : 'New Item'}</h3>
                  <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="aspect-[16/7] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative group border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                      {productForm.image_url ? (
                        <img src={productForm.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload size={24} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) setProductForm({ ...productForm, image_url: url });
                            }
                          }}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Name</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Price (₱)</label>
                          <input
                            type="number"
                            value={productForm.price_php}
                            onChange={e => setProductForm({ ...productForm, price_php: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Category</label>
                          <select
                            value={productForm.category}
                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Description</label>
                        <textarea
                          value={productForm.description}
                          onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Stock Status</label>
                        <select
                          value={productForm.stock_status}
                          onChange={e => setProductForm({ ...productForm, stock_status: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="available">Available</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button onClick={handleSaveProduct} className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2">
                    <Save size={20} /> Save Item
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col group/card hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[16/7] relative overflow-hidden">
                    <img src={product.image_url} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setProductForm(product); }}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg text-primary shadow-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg text-red-500 shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-accent uppercase">{product.category}</span>
                      <span className="font-bold text-primary">₱{product.price_php.toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold mb-1">{product.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold font-display mb-8">Manage Categories</h2>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Plus size={20} /> Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group">
                  <span className="font-bold">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && settings && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight font-display mb-2">Site Settings</h2>
                <p className="text-slate-500">Configure your website's identity, contact info, and content.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all"
              >
                <Save size={20} /> Save All Changes
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
              {/* Left Column - Navigation-like Grouping */}
              <div className="lg:col-span-4 space-y-8">
                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Phone size={18} />
                    </div>
                    Contact Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Email Address</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={e => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                      <MapPin size={18} />
                    </div>
                    Store Location
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Drag the marker to pinpoint your store on the map.</p>
                  <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                    <MapContainer center={[settings.lat, settings.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <DraggableMarker />
                    </MapContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center text-xs font-bold text-slate-500 uppercase">
                      Lat: {settings.lat.toFixed(4)}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center text-xs font-bold text-slate-500 uppercase">
                      Lng: {settings.lng.toFixed(4)}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column - Brand & Content */}
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <ImageIcon size={18} />
                    </div>
                    Brand & Visuals
                  </h3>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">Headline (Motto)</label>
                      <textarea
                        value={settings.motto}
                        onChange={e => setSettings({ ...settings, motto: e.target.value })}
                        rows={2}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-xl md:text-2xl tracking-tight resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Hero Image</label>
                        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden relative group border-4 border-slate-50 dark:border-slate-800 shadow-md">
                          <img src={settings.hero_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                            <Upload size={32} className="text-white mb-2" />
                            <span className="text-white text-xs font-black uppercase">Change Image</span>
                            <input type="file" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file, 'SaquilanWebsite');
                                if (url) setSettings({ ...settings, hero_image_url: url });
                              }
                            }} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">About Image</label>
                        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden relative group border-4 border-slate-50 dark:border-slate-800 shadow-md">
                          <img src={settings.about_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                            <Upload size={32} className="text-white mb-2" />
                            <span className="text-white text-xs font-black uppercase">Change Image</span>
                            <input type="file" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file, 'SaquilanWebsite');
                                if (url) setSettings({ ...settings, about_image_url: url });
                              }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                      <ImageIcon size={18} />
                    </div>
                    Business Story
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">About Slogan</label>
                      <input
                        type="text"
                        value={settings.about_slogan}
                        onChange={e => setSettings({ ...settings, about_slogan: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Our Story (Full Description)</label>
                      <textarea
                        value={settings.our_story}
                        onChange={e => setSettings({ ...settings, our_story: e.target.value })}
                        rows={6}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Store size={18} />
                    </div>
                    Legal & Footer
                  </h3>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Footer Bio Text</label>
                    <textarea
                      value={settings.footer_text}
                      onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                      rows={2}
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all font-medium resize-none"
                    />
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
