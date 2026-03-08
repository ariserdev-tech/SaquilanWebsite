import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  image_url: string;
  price_php: number;
  category: string;
  stock_status: 'available' | 'out_of_stock';
  description: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  motto: string;
  hero_image_url: string;
  our_story: string;
  about_image_url: string;
  about_slogan: string;
  footer_text: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_place: string;
  customer_phone: string;
  pickup_date: string;
  message: string;
  items: string; // Serialized list of items
  total_price: number;
  created_at?: string;
}


