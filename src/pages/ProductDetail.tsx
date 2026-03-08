import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Product } from '../lib/supabaseClient';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && data) {
                setProduct(data as Product);
            }
            setLoading(false);
        }

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="animate-spin text-accent" size={48} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <p className="mb-4">Product not found.</p>
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center underline mx-auto">
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-slate-300 hover:text-white">
                <ArrowLeft size={20} className="mr-2" /> Back to shop
            </button>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-auto object-cover" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-lg mb-6 text-slate-400">{product.description}</p>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-bold text-primary">₱{product.price_php.toLocaleString()}</span>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${product.stock_status === 'out_of_stock' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                            {product.stock_status === 'out_of_stock' ? 'OUT OF STOCK' : 'AVAILABLE'}
                        </span>
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock_status === 'out_of_stock'}
                        className="w-full md:w-auto px-8 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ShoppingCart size={20} />
                        Order This Item
                    </button>

                </div>
            </div>
        </div>
    );
}
