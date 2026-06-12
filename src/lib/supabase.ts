import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
  bio: string | null; location: string | null; website_url: string | null;
  is_verified: boolean; is_seller: boolean; seller_rating: number;
  total_sales: number; total_purchases: number; total_earnings: number;
  created_at: string; updated_at: string;
};

export type Listing = {
  id: string; seller_id: string; title: string; description: string | null;
  price: number; original_price: number | null; currency: string;
  condition: 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor';
  condition_details: string | null; brand: string; series: string | null;
  model_number: string | null; year_released: number | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'super_rare' | 'chase' | 'treasure_hunt' | 'super_treasure_hunt' | null;
  color: string | null; scale: string; packaging: 'sealed' | 'opened' | 'carded' | 'loose' | 'blister_pack' | null;
  images: string[]; primary_image: string | null;
  listing_type: 'fixed' | 'auction' | 'trade' | 'both';
  status: 'draft' | 'pending_review' | 'active' | 'sold' | 'ended' | 'cancelled' | 'rejected';
  quantity: number; quantity_sold: number; views_count: number; watchlist_count: number;
  featured: boolean; category_id: string | null; tags: string[];
  created_at: string; updated_at: string; published_at: string | null; ended_at: string | null;
  seller?: Profile; auction?: Auction;
};

export type Auction = {
  id: string; listing_id: string; starting_price: number; current_price: number;
  reserve_price: number | null; buy_now_price: number | null; bid_count: number;
  minimum_bid_increment: number; start_time: string; end_time: string;
  status: 'scheduled' | 'live' | 'ended' | 'sold' | 'cancelled';
  winner_id: string | null; winning_bid_id: string | null; created_at: string;
};

export type Bid = {
  id: string; auction_id: string; bidder_id: string; amount: number;
  max_bid: number | null; is_winning: boolean; created_at: string; bidder?: Profile;
};

export type Order = {
  id: string; buyer_id: string; seller_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  subtotal: number; shipping_cost: number; tax: number; total: number; currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null; stripe_payment_intent_id: string | null;
  shipping_address: Record<string, unknown> | null; tracking_number: string | null;
  carrier: string | null; notes: string | null;
  created_at: string; updated_at: string; shipped_at: string | null; delivered_at: string | null;
  buyer?: Profile; seller?: Profile; order_items?: OrderItem[];
};

export type OrderItem = {
  id: string; order_id: string; listing_id: string | null;
  title: string; price: number; quantity: number; image_url: string | null; created_at: string;
};

export type Conversation = {
  id: string; participant_one: string; participant_two: string;
  listing_id: string | null; last_message: string | null;
  last_message_at: string | null; created_at: string; other_participant?: Profile;
};

export type Message = {
  id: string; conversation_id: string; sender_id: string;
  content: string; read_at: string | null; created_at: string; sender?: Profile;
};

export type Review = {
  id: string; reviewer_id: string; reviewee_id: string;
  listing_id: string | null; order_id: string | null;
  rating: number; title: string | null; content: string | null;
  images: string[]; is_verified_purchase: boolean; created_at: string;
  reviewer?: Profile; reviewee?: Profile;
};

export type Notification = {
  id: string; user_id: string; type: string;
  title: string; content: string | null; data: Record<string, unknown> | null;
  read_at: string | null; created_at: string;
};

export type CartItem = { id: string; listing: Listing; quantity: number; };
