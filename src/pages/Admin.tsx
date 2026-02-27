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

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin' }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Image Management
  const uploadImage = async (file: File, bucket: string = 'merchandise') => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
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
        await deleteImage(editingProduct.image_url);
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
      await deleteImage(product.image_url);
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) setProducts(products.filter(p => p.id !== product.id));
    }
  };

  // Category Actions
  const [newCatName, setNewCatName] = useState('');
  const handleAddCategory = async () => {
    if (!newCatName) return;
    const { data, error } = await supabase.from('categories').insert([{ name: newCatName }]).select().single();
    if (!error && data) {
      setCategories([...categories, data]);
      setNewCatName('');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl text-center border border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8">
            <Store size={40} />
          </div>
          <h1 className="text-3xl font-extrabold font-display mb-4">Admin Login</h1>
          <p className="text-slate-500 mb-8">Please sign in with your Google account to manage SaquilanMerchandise.</p>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Mail size={20} /> Sign in with Google
          </button>
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
                    <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative group">
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                  <div className="aspect-[16/10] relative">
                    <img src={product.image_url} className="w-full h-full object-cover" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold font-display">Site Settings</h2>
              <button onClick={handleSaveSettings} className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                <Save size={20} /> Save All Changes
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Contact & Location */}
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Phone size={20} className="text-primary" /> Credentials</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={e => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin size={20} className="text-primary" /> GPS Location</h3>
                  <p className="text-sm text-slate-500 mb-4">Drag the marker to update your store location.</p>
                  <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <MapContainer center={[settings.lat, settings.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <DraggableMarker />
                    </MapContainer>
                  </div>
                </div>
              </div>

              {/* Content Settings */}
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-primary" /> Hero & About</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Motto (Hero Headline)</label>
                      <textarea
                        value={settings.motto}
                        onChange={e => setSettings({ ...settings, motto: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Hero Image</label>
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group">
                          <img src={settings.hero_image_url} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Upload size={20} className="text-white" />
                            <input type="file" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file, 'site-assets');
                                if (url) setSettings({ ...settings, hero_image_url: url });
                              }
                            }} />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">About Image</label>
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group">
                          <img src={settings.about_image_url} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Upload size={20} className="text-white" />
                            <input type="file" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file, 'site-assets');
                                if (url) setSettings({ ...settings, about_image_url: url });
                              }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">About Slogan</label>
                      <input
                        type="text"
                        value={settings.about_slogan}
                        onChange={e => setSettings({ ...settings, about_slogan: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Our Story</label>
                      <textarea
                        value={settings.our_story}
                        onChange={e => setSettings({ ...settings, our_story: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Footer Text (Above Copyright)</label>
                      <textarea
                        value={settings.footer_text}
                        onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
