import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, Package } from 'lucide-react';
import { Product } from '@/src/lib/supabaseClient';

// Mock data for initial admin view
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    image_url: 'https://picsum.photos/seed/audio/600/600',
    price_php: 4999,
    category: 'Electronics',
    stock_status: 'available',
    description: 'High-fidelity audio with noise cancellation.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Minimalist Leather Wallet',
    image_url: 'https://picsum.photos/seed/wallet/600/600',
    price_php: 1250,
    category: 'Accessories',
    stock_status: 'available',
    description: 'Genuine leather, slim design.',
    created_at: new Date().toISOString(),
  },
];

export default function Admin() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price_php: 0,
    category: 'General',
    description: '',
    stock_status: 'available',
    image_url: 'https://picsum.photos/seed/new/600/600'
  });

  const handleSave = () => {
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
      setEditingId(null);
    } else {
      const newProduct: Product = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as Product;
      setProducts([newProduct, ...products]);
      setIsAdding(false);
    }
    setFormData({ name: '', price_php: 0, category: 'General', description: '', stock_status: 'available', image_url: 'https://picsum.photos/seed/new/600/600' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this merchandise?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display">Admin Panel</h1>
            <p className="text-slate-500">Manage your store merchandises</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-display">{editingId ? 'Edit Merchandise' : 'Add New Merchandise'}</h2>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price_php}
                    onChange={e => setFormData({ ...formData, price_php: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Stock Status</label>
                <select
                  value={formData.stock_status}
                  onChange={e => setFormData({ ...formData, stock_status: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Save size={20} /> Save Merchandise
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Item</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-primary dark:text-blue-400">
                  ₱{product.price_php.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    product.stock_status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {product.stock_status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditingId(product.id); setFormData(product); }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
