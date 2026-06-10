import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Heart, Settings, Star, Eye, ChevronRight, Plus, DollarSign, Edit, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserListings, useUserOrders, useConversations, useIsAdmin } from '../lib/useData';
import { LoadingPage } from '../components/ui/Loading';
import { formatPrice, formatRelativeTime, getConditionLabel, cn } from '../lib/utils';

const sidebarItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/listings', label: 'My Listings', icon: Package },
  { path: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { isAdmin } = useIsAdmin(user);
  const navigate = useNavigate();
  const location = useLocation();
  const { listings, loading: listingsLoading } = useUserListings(user?.id);
  const { orders: buyerOrders, loading: buyerOrdersLoading } = useUserOrders(user?.id, 'buyer');
  const { orders: sellerOrders, loading: sellerOrdersLoading } = useUserOrders(user?.id, 'seller');
  const { conversations, loading: conversationsLoading } = useConversations(user?.id);

  if (authLoading || !user) return <LoadingPage />;

  const currentPath = location.pathname;
  const showOverview = currentPath === '/dashboard';
  const showListings = currentPath === '/dashboard/listings';
  const showOrders = currentPath === '/dashboard/orders';
  const showSettings = currentPath === '/dashboard/settings';

  const sidebarWithCounts = sidebarItems.map(item => {
    if (item.path === '/dashboard/listings') return { ...item, count: listings.length };
    if (item.path === '/dashboard/orders') return { ...item, count: buyerOrders.length + sellerOrders.length };
    if (item.path === '/dashboard/messages') return { ...item, count: conversations.length };
    return item;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-700">
                <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary-400">{profile?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{profile?.display_name || profile?.username}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {profile?.seller_rating?.toFixed(1) || 'New'}
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarWithCounts.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl transition-colors',
                      currentPath === item.path || (item.path === '/dashboard' && showOverview)
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-gray-400 hover:bg-dark-800/50 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-2 py-0.5 bg-dark-700 rounded-full text-xs">{item.count}</span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-dark-700 space-y-2">
                <Link to="/sell" className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" />Sell Item
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn-secondary w-full justify-center">
                    <Settings className="w-4 h-4" />Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {showOverview && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-display font-bold text-white mb-2">
                    Welcome back, {profile?.display_name?.split(' ')[0] || profile?.username}!
                  </h1>
                  <p className="text-gray-400">Here is what is happening with your store</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    [DollarSign, `$${profile?.total_earnings || 0}`, 'Total Earnings', 'text-green-400'],
                    [Package, listings.length.toString(), 'Active Listings', 'text-blue-400'],
                    [ShoppingCart, (buyerOrders.length + sellerOrders.length).toString(), 'Orders', 'text-yellow-400'],
                    [Eye, listings.reduce((sum, l) => sum + (l.views_count || 0), 0).toLocaleString(), 'Total Views', 'text-primary-400'],
                  ].map(([Icon, value, label, colorClass], i) => (
                    <div key={i} className="stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
                          <Icon className={cn('w-5 h-5', colorClass)} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{value as string}</p>
                      <p className="text-sm text-gray-400">{label as string}</p>
                    </div>
                  ))}
                </div>

                {listings.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <LayoutDashboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Your dashboard is ready. Start selling!</p>
                    <Link to="/sell" className="btn-primary">List Your First Item</Link>
                  </div>
                ) : (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white">Recent Listings</h2>
                      <Link to="/dashboard/listings" className="text-sm text-primary-400 hover:text-primary-300">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {listings.slice(0, 5).map(listing => (
                        <div key={listing.id} className="flex items-center gap-4 p-3 rounded-lg bg-dark-800/50">
                          <div className="w-16 h-16 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                            {listing.primary_image ? (
                              <img src={listing.primary_image} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 text-gray-600 m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{listing.title}</p>
                            <p className="text-sm text-gray-400">
                              {formatPrice(listing.price)} • {listing.status}
                            </p>
                          </div>
                          <Link to={`/listing/${listing.id}`} className="btn-secondary-sm">
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {showListings && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-display font-bold text-white">My Listings</h1>
                  <Link to="/sell" className="btn-primary"><Plus className="w-4 h-4" />New Listing</Link>
                </div>

                {listingsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : listings.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">You haven't listed any items yet.</p>
                    <Link to="/sell" className="btn-primary">Create Your First Listing</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map(listing => (
                      <div key={listing.id} className="glass-card p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
                            {listing.primary_image ? (
                              <img src={listing.primary_image} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-10 h-10 text-gray-600 m-auto mt-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/listing/${listing.id}`} className="font-semibold text-white hover:text-primary-400 line-clamp-1">
                              {listing.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span className="font-medium text-white">{formatPrice(listing.price)}</span>
                              <span>{getConditionLabel(listing.condition)}</span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs',
                                listing.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                listing.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              )}>
                                {listing.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Listed {formatRelativeTime(listing.created_at)} • {listing.views_count || 0} views
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="btn-icon"><Edit className="w-4 h-4" /></button>
                            <button className="btn-icon text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showOrders && (
              <div>
                <h1 className="text-2xl font-display font-bold text-white mb-6">Orders</h1>

                {(buyerOrdersLoading || sellerOrdersLoading) ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : buyerOrders.length === 0 && sellerOrders.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No orders yet.</p>
                    <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sellerOrders.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Sales ({sellerOrders.length})</h2>
                        <div className="space-y-3">
                          {sellerOrders.map(order => (
                            <div key={order.id} className="glass-card p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-gray-400">{formatRelativeTime(order.created_at)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">{formatPrice(order.total_amount)}</p>
                                  <span className={cn(
                                    'text-xs px-2 py-1 rounded-full',
                                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  )}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {buyerOrders.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Purchases ({buyerOrders.length})</h2>
                        <div className="space-y-3">
                          {buyerOrders.map(order => (
                            <div key={order.id} className="glass-card p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-gray-400">{formatRelativeTime(order.created_at)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">{formatPrice(order.total_amount)}</p>
                                  <span className={cn(
                                    'text-xs px-2 py-1 rounded-full',
                                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  )}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {showSettings && (
              <div>
                <h1 className="text-2xl font-display font-bold text-white mb-6">Settings</h1>
                <div className="glass-card p-6">
                  <p className="text-gray-400">Profile settings coming soon...</p>
                </div>
              </div>
            )}

            {currentPath === '/dashboard/messages' && (
              <div>
                <h1 className="text-2xl font-display font-bold text-white mb-6">Messages</h1>
                <div className="glass-card p-6">
                  <Link to="/messages" className="text-primary-400 hover:text-primary-300">
                    Go to Messages
                  </Link>
                </div>
              </div>
            )}

            {currentPath === '/dashboard/wishlist' && (
              <div>
                <h1 className="text-2xl font-display font-bold text-white mb-6">Wishlist</h1>
                <div className="glass-card p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
                  <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
