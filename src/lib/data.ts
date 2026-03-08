import { Product, SiteSettings, Category } from './supabaseClient';

export const categories: Category[] = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Fashion' },
    { id: '3', name: 'Home & Living' },
    { id: '4', name: 'Groceries' },
];

export const products: Product[] = [
    {
        id: 'p1',
        name: 'Premium Wireless Headphones',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        price_php: 2499,
        category: 'Electronics',
        stock_status: 'available',
        description: 'High-quality wireless headphones with noise-canceling technology and long battery life. Perfect for music lovers and professionals.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'p2',
        name: 'Smart Watch Series 5',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        price_php: 5999,
        category: 'Electronics',
        stock_status: 'available',
        description: 'Stay connected with this sleek smart watch featuring heart rate monitoring, GPS, and a beautiful OLED display.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'p3',
        name: 'Designer Cotton T-shirt',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        price_php: 899,
        category: 'Fashion',
        stock_status: 'available',
        description: 'Comfortable and stylish 100% cotton T-shirt, available in various colors and sizes.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'p4',
        name: 'Minimalist Wall Clock',
        image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000&auto=format&fit=crop',
        price_php: 1200,
        category: 'Home & Living',
        stock_status: 'out_of_stock',
        description: 'A modern and minimalist wall clock that adds a touch of sophistication to any room.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'p5',
        name: 'Organic Ground Coffee',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop',
        price_php: 450,
        category: 'Groceries',
        stock_status: 'available',
        description: 'Rich and aromatic organic ground coffee sourced from the finest beans.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'p6',
        name: 'Ceramic Table Lamp',
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
        price_php: 1850,
        category: 'Home & Living',
        stock_status: 'available',
        description: 'Elegant ceramic table lamp providing warm and cozy lighting for your bedside or workspace.',
        created_at: new Date().toISOString(),
    }
];

export const siteSettings: SiteSettings = {
    id: 'settings-1',
    phone: '+63 912 345 6789',
    email: 'contact@saquilan.com',
    lat: 5.9897,
    lng: 124.6311,
    motto: 'Premium Merchandises for Every Store & Customer.',
    hero_image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
    our_story: 'SaquilanMerchandise started with a simple goal: to provide high-quality products to the community of Sarangani. We believe in excellence, reliability, and bringing the best value to our customers, whether they are wholesale partners or individual shoppers.',
    about_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop',
    about_slogan: 'Excellence in every delivery.',
    footer_text: 'Your trusted partner for premium merchandises in Sarangani Province.'
};
