import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin, useSiteSettings } from '../lib/useData';
import { supabase } from '../lib/supabase';
import {
  Settings, Users, Package, Gavel, DollarSign, AlertTriangle,
  Image, Save, X, Upload, Trash2, Edit, Check, Loader2, Monitor
} from 'lucide-react';
import type { Category } from '../lib/supabase';
import type { SiteSettings } from '../lib/useData';

export function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('banner');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeAuctions: 0,
    totalRevenue: 0,
  });

  // Banner settings form
  const [bannerForm, setBannerForm] = useState({
    hero_banner_url: '',
    hero_title: '',
    hero_subtitle: '',
    feature_banner_url: '',
    feature_title: '',
    feature_subtitle: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (siteSettings) {
      setBannerForm({
        hero_banner_url: siteSettings.hero_banner_url || '',
        hero_title: siteSettings.hero_title || '',
        hero_subtitle: siteSettings.hero_subtitle || '',
        feature_banner_url: siteSettings.feature_banner_url || '',
        feature_title: siteSettings.feature_title || '',
        feature_subtitle: siteSettings.feature_subtitle || '',
      });
    }
  }, [siteSettings]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const [usersRes, listingsRes, auctionsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('status', 'live'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalListings: listingsRes.count || 0,
        activeAuctions: auctionsRes.count || 0,
        totalRevenue: 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  async function handleSaveCategoryImage(categoryId: string) {
    if (!editImageUrl.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ image_url: editImageUrl.trim() })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, image_url: editImageUrl.trim() } : cat
      ));
      setEditingCategory(null);
      setEditImageUrl('');
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Failed to update category image');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearCategoryImage(categoryId: string) {
    if (!confirm('Are you sure you want to remove this category image?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ image_url: null })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, image_url: null } : cat
      ));
    } catch (err) {
      console.error('Error clearing category image:', err);
      alert('Failed to clear category image');
    }
  }

  async function handleSaveBannerSettings() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          hero_banner_url: bannerForm.hero_banner_url || null,
          hero_title: bannerForm.hero_title || null,
          hero_subtitle: bannerForm.hero_subtitle || null,
          feature_banner_url: bannerForm.feature_banner_url || null,
          feature_title: bannerForm.feature_title || null,
          feature_subtitle: bannerForm.feature_subtitle || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default');

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (adminLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'banner', label: 'Homepage Banner', icon: Monitor },
    { id: 'categories', label: 'Categories', icon: Image },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Package },
    { id: 'auctions', label: 'Auctions', icon: Gavel },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your marketplace appearance and content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers },
            { icon: Package, label: 'Total Listings', value: stats.totalListings },
            { icon: Gavel, label: 'Active Auctions', value: stats.activeAuctions },
            { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue}` },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6">
              <stat.icon className="w-8 h-8 text-primary-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-4 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'banner' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-2">Homepage Banner Settings</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Customize the hero section and feature banners on the homepage. Use direct image URLs from image hosting services.
                </p>

                <div className="space-y-8">
                  {/* Hero Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hero Banner Image URL</label>
                        <input
                          type="url"
                          value={bannerForm.hero_banner_url}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, hero_banner_url: e.target.value }))}
                          placeholder="https://example.com/banner.jpg"
                          className="input w-full"
                        />
                      </div>

                      {bannerForm.hero_banner_url && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800">
                          <img
                            src={bannerForm.hero_banner_url}
                            alt="Hero banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%2318181b" width="400" height="200"/><text fill="%2371717a" x="50%" y="50%" text-anchor="middle">Invalid image URL</text></svg>';
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hero Title</label>
                        <input
                          type="text"
                          value={bannerForm.hero_title}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, hero_title: e.target.value }))}
                          placeholder="Collect, Trade & Sell Hot Wheels"
                          className="input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hero Subtitle</label>
                        <textarea
                          value={bannerForm.hero_subtitle}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                          placeholder="Join thousands of collectors buying, selling, and auctioning rare Hot Wheels and die-cast treasures."
                          className="input w-full"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature Section */}
                  <div className="pt-6 border-t border-dark-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Feature Section (Optional)</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Feature Banner Image URL</label>
                        <input
                          type="url"
                          value={bannerForm.feature_banner_url}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, feature_banner_url: e.target.value }))}
                          placeholder="https://example.com/feature.jpg"
                          className="input w-full"
                        />
                      </div>

                      {bannerForm.feature_banner_url && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800">
                          <img
                            src={bannerForm.feature_banner_url}
                            alt="Feature banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%2318181b" width="400" height="200"/><text fill="%2371717a" x="50%" y="50%" text-anchor="middle">Invalid image URL</text></svg>';
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Feature Title</label>
                        <input
                          type="text"
                          value={bannerForm.feature_title}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, feature_title: e.target.value }))}
                          placeholder="Featured Collection"
                          className="input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Feature Subtitle</label>
                        <textarea
                          value={bannerForm.feature_subtitle}
                          onChange={(e) => setBannerForm(prev => ({ ...prev, feature_subtitle: e.target.value }))}
                          placeholder="Description for the featured section"
                          className="input w-full"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBannerSettings}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Save Banner Settings</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-2">Category Images</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Manage images for each category displayed on the homepage. Recommended size: 400x400px.
                </p>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                      <div key={category.id} className="bg-dark-800 rounded-xl overflow-hidden">
                        <div className="aspect-square relative bg-dark-900">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-16 h-16 text-gray-700" />
                            </div>
                          )}
                          {category.image_url && (
                            <button
                              onClick={() => handleClearCategoryImage(category.id)}
                              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-3">{category.name}</h3>

                          {editingCategory === category.id ? (
                            <div className="space-y-3">
                              <input
                                type="url"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                placeholder="Enter image URL..."
                                className="input w-full text-sm"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveCategoryImage(category.id)}
                                  disabled={saving || !editImageUrl.trim()}
                                  className="flex-1 btn-primary py-2 text-sm"
                                >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                                </button>
                                <button
                                  onClick={() => { setEditingCategory(null); setEditImageUrl(''); }}
                                  className="btn-secondary py-2 text-sm"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCategory(category.id);
                                setEditImageUrl(category.image_url || '');
                              }}
                              className="w-full btn-secondary py-2 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              {category.image_url ? 'Change Image' : 'Add Image'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-4">User Management</h2>
                <p className="text-gray-400">User management features coming soon...</p>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-4">Listing Management</h2>
                <p className="text-gray-400">Listing moderation features coming soon...</p>
              </div>
            )}

            {activeTab === 'auctions' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-4">Auction Management</h2>
                <p className="text-gray-400">Auction management features coming soon...</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-4">Reports</h2>
                <p className="text-gray-400">Report handling features coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-white mb-4">Settings</h2>
                <p className="text-gray-400">Platform settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
