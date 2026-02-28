import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Product } from '@/src/lib/supabaseClient';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setProduct(data as Product);
            } catch (e) {
                console.error('Failed to load product', e);
            } finally {
                setLoading(false);
            }
        };
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
                <p>Product not found.</p>
                <button onClick={() => navigate(-1)} className="ml-4 underline">
                    <ArrowLeft size={20} /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-slate-300 hover:text-white">
                <ArrowLeft size={20} className="mr-2" /> Back to shop
            </button>
            <div className="grid md:grid-cols-2 gap-8">
                <img src={product.image_url} alt={product.name} className="w-full h-auto object-cover rounded-xl" />
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-lg mb-4">{product.description}</p>
                    <span className="text-2xl font-bold text-primary mb-4">₱{product.price_php.toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-full ${product.stock_status === 'out_of_stock' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                        {product.stock_status === 'out_of_stock' ? 'OUT OF STOCK' : 'AVAILABLE'}
                    </span>
                </div>
            </div>
        </div>
    );
}
