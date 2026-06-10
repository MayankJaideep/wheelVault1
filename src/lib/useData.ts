import { useState, useEffect, useCallback } from 'react';
import { supabase, type Listing, type Auction, type Category, type Profile, type Bid, type Order, type Message, type Conversation, type Notification } from './supabase';
import type { User } from '@supabase/supabase-js';

// Fetch listings with optional filters
export function useListings(filters?: {
  search?: string; category?: string; condition?: string; rarity?: string;
  brand?: string; minPrice?: number; maxPrice?: number; sortBy?: string;
  featured?: boolean; status?: string; sellerId?: string; limit?: number;
}) {
  const [listings, setListings] = useState<(Listing & { auction?: Auction; seller?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('listings')
          .select('*, seller:profiles(*), auction:auctions(*)')
          .eq('status', filters?.status || 'active');

        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,series.ilike.%${filters.search}%`);
        }
        if (filters?.category) {
          query = query.eq('category_id', filters.category);
        }
        if (filters?.condition) {
          query = query.eq('condition', filters.condition);
        }
        if (filters?.rarity) {
          query = query.eq('rarity', filters.rarity);
        }
        if (filters?.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (filters?.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters?.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters?.featured) {
          query = query.eq('featured', true);
        }
        if (filters?.sellerId) {
          query = query.eq('seller_id', filters.sellerId);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        // Sorting
        switch (filters?.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'popular':
            query = query.order('views_count', { ascending: false });
            break;
          case 'ending_soon':
            query = query.order('ended_at', { ascending: true });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setListings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [filters?.search, filters?.category, filters?.condition, filters?.rarity, filters?.brand, filters?.minPrice, filters?.maxPrice, filters?.sortBy, filters?.featured, filters?.status, filters?.sellerId, filters?.limit]);

  return { listings, loading, error, refetch: () => setLoading(true) };
}

// Fetch single listing
export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<(Listing & { auction?: Auction; seller?: Profile; bids?: (Bid & { bidder: Profile })[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    async function fetchListing() {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*, seller:profiles(*), auction:auctions(*)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // If auction, fetch bids
        if (data?.auction) {
          const { data: bids } = await supabase
            .from('bids')
            .select('*, bidder:profiles(*)')
            .eq('auction_id', data.auction.id)
            .order('amount', { ascending: false })
            .limit(10);
          data.bids = bids;
        }

        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  return { listing, loading, error };
}

// Fetch categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Fetch auctions
export function useAuctions(filters?: { status?: string; endingSoon?: boolean; limit?: number }) {
  const [auctions, setAuctions] = useState<(Listing & { auction: Auction; seller?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      setLoading(true);
      try {
        let query = supabase
          .from('listings')
          .select('*, seller:profiles(*), auction:auctions(*)')
          .in('listing_type', ['auction', 'both'])
          .eq('status', 'active');

        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Filter by auction status and end time
        let filtered = (data || []).filter(l => l.auction && l.auction.status === (filters?.status || 'live'));

        if (filters?.endingSoon) {
          const now = Date.now();
          filtered = filtered.filter(l => l.auction && new Date(l.auction.end_time).getTime() - now < 24 * 60 * 60 * 1000);
        }

        setAuctions(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch auctions');
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, [filters?.status, filters?.endingSoon, filters?.limit]);

  return { auctions, loading, error };
}

// User's listings
export function useUserListings(userId: string | undefined) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchListings() {
      try {
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setListings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [userId]);

  return { listings, loading, error };
}

// User's orders
export function useUserOrders(userId: string | undefined, role: 'buyer' | 'seller') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchOrders() {
      try {
        const field = role === 'buyer' ? 'buyer_id' : 'seller_id';
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*, buyer:profiles!orders_buyer_id_fkey(*), seller:profiles!orders_seller_id_fkey(*)')
          .eq(field, userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setOrders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId, role]);

  return { orders, loading, error };
}

// Conversations
export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<(Conversation & { other_participant: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchConversations() {
      try {
        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
          .order('last_message_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Fetch other participant profiles
        const conversationsWithParticipants = await Promise.all((data || []).map(async (conv) => {
          const otherId = conv.participant_one === userId ? conv.participant_two : conv.participant_one;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single();
          return { ...conv, other_participant: profile };
        }));

        setConversations(conversationsWithParticipants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [userId]);

  return { conversations, loading, error };
}

// Messages for a conversation
export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }

    async function fetchMessages() {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*, sender:profiles(*)')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const { data: sender } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.sender_id)
          .single();
        setMessages(prev => [...prev, { ...payload.new as Message, sender: sender }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return { messages, loading, error, setMessages };
}

// User notifications
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchNotifications() {
      try {
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;
        setNotifications(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [userId]);

  return { notifications, loading, error };
}

// Admin: Check if user is admin
export function useIsAdmin(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }

    async function checkAdmin() {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.role === 'admin');
      setLoading(false);
    }

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}

// Site settings (for public display)
export interface SiteSettings {
  id: string;
  hero_banner_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  feature_banner_url: string | null;
  feature_title: string | null;
  feature_subtitle: string | null;
  updated_at: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error: fetchError } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (fetchError) throw fetchError;
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch site settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
