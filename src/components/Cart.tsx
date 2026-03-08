import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, Send, Loader2, Calendar, User, Phone, MessageSquare, MapPin, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';


type CheckoutStep = 'cart' | 'form';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();
    const [step, setStep] = useState<CheckoutStep>('cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        place: '',
        pickupDate: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getOrderCount = () => {
        const orders = localStorage.getItem('saquilan_order_count');
        return orders ? parseInt(orders) : 0;
    };

    const incrementOrderCount = () => {
        const count = getOrderCount();
        localStorage.setItem('saquilan_order_count', (count + 1).toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (getOrderCount() >= 5) {
            alert('You have reached the limit of 5 orders per device.');
            return;
        }

        if (cart.length === 0) return;

        setIsSubmitting(true);

        const itemsList = cart.map(item => `${item.name} (x${item.quantity}) - ₱${(item.price_php * item.quantity).toLocaleString()}`).join('\n');

        const templateParams = {
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_place: formData.place,
            pickup_date: formData.pickupDate,
            message: formData.message,
            items: itemsList,
            total_price: `₱${totalPrice.toLocaleString()}`,
        };

        try {
            // 1. Store in Supabase first
            await supabase.from('orders').insert([{
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_place: formData.place,
                pickup_date: formData.pickupDate,
                message: formData.message,
                items: itemsList,
                total_price: totalPrice,
            }]);

            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                console.log('Order Details (Dev Mode):', templateParams);
                setOrderStatus('success');
                incrementOrderCount();
                clearCart();
                setStep('cart');
                setFormData({ name: '', phone: '', place: '', pickupDate: '', message: '' });
                return;
            }

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            setOrderStatus('success');
            incrementOrderCount();
            clearCart();
            setStep('cart');
            setFormData({ name: '', phone: '', place: '', pickupDate: '', message: '' });
        } catch (error) {
            console.error('Failed to send order:', error);
            setOrderStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setOrderStatus('idle'), 5000);
        }
    };

    const resetAndClose = () => {
        setIsCartOpen(false);
        setTimeout(() => setStep('cart'), 300);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={resetAndClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 z-[101] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {step === 'form' ? (
                                    <button onClick={() => setStep('cart')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                                        <ArrowLeft size={20} />
                                    </button>
                                ) : (
                                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                                        <ShoppingBag size={24} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold">{step === 'cart' ? 'Your Cart' : 'Checkout Details'}</h2>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                                        {step === 'cart' ? `${cart.length} ${cart.length === 1 ? 'item' : 'items'}` : 'Complete your information'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={resetAndClose}
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                            {cart.length === 0 && step === 'cart' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-2">
                                        <ShoppingBag size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold">Your cart is empty</h3>
                                    <p className="text-slate-500 max-w-[240px]">
                                        Looks like you haven't added any products to your cart yet.
                                    </p>
                                    <button
                                        onClick={resetAndClose}
                                        className="px-8 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : step === 'cart' ? (
                                <div className="space-y-6">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-primary mb-3">₱{item.price_php.toLocaleString()}</p>
                                                <div className="flex items-center gap-3 bg-slate-800 w-fit rounded-lg px-2 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold">Ordering for Pick-up</h3>
                                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                                                <User size={10} /> Full Name
                                            </label>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-white text-sm"
                                                placeholder="Juan Dela Cruz"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                                                <MapPin size={10} /> Place / Address
                                            </label>
                                            <input
                                                required
                                                name="place"
                                                value={formData.place}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-white text-sm"
                                                placeholder="Brgy. Badtasan, Kiamba"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                                                <Phone size={10} /> Contact Number
                                            </label>
                                            <input
                                                required
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-white text-sm"
                                                placeholder="0912 345 6789"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                                                <Calendar size={10} /> Day of Pick-up
                                            </label>
                                            <input
                                                required
                                                name="pickupDate"
                                                type="date"
                                                value={formData.pickupDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-white text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                                                <MessageSquare size={10} /> Message (Optional)
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-white text-sm resize-none"
                                                placeholder="Any special instructions?"
                                            />
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-slate-400 font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-white">₱{totalPrice.toLocaleString()}</span>
                                </div>

                                {step === 'cart' ? (
                                    <button
                                        onClick={() => setStep('form')}
                                        className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all"
                                    >
                                        Place Order
                                    </button>
                                ) : (
                                    <button
                                        form="checkout-form"
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <ShoppingCart size={20} />
                                                Check Out
                                            </>
                                        )}
                                    </button>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Max 5 orders per device
                                </div>
                            </div>
                        )}

                        {orderStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-x-6 bottom-32 bg-green-500 text-white p-4 rounded-xl font-bold text-center shadow-2xl z-50"
                            >
                                Thank you! Your order has been placed.
                            </motion.div>
                        )}

                        {orderStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-x-6 bottom-32 bg-red-500 text-white p-4 rounded-xl font-bold text-center shadow-2xl z-50"
                            >
                                Oops! Failed to place order. Please try again.
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
