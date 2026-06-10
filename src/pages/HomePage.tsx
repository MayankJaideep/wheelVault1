import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star, Shield, Truck, Users, Zap, ChevronRight, Gavel, Package } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { LoadingGrid } from '../components/ui/Loading';
import { useListings, useCategories, useAuctions, useSiteSettings } from '../lib/useData';

const stats = [
  { icon: Users, value: '125K+', label: 'Collectors' },
  { icon: TrendingUp, value: '2.5M+', label: 'Listings' },
  { icon: Gavel, value: '500K+', label: 'Auctions Won' },
  { icon: Star, value: '4.9', label: 'Avg Rating' },
];

export function HomePage() {
  const { listings: featuredListings, loading: featuredLoading } = useListings({ featured: true, limit: 4 });
  const { listings: trendingListings, loading: trendingLoading } = useListings({ sortBy: 'popular', limit: 4 });
  const { auctions, loading: auctionsLoading } = useAuctions({ limit: 3 });
  const { categories, loading: categoriesLoading } = useCategories();
  const { settings: siteSettings } = useSiteSettings();

  const heroTitle = siteSettings?.hero_title || 'Collect, Trade & Sell Hot Wheels';
  const heroSubtitle = siteSettings?.hero_subtitle || 'Join thousands of collectors buying, selling, and auctioning rare Hot Wheels and die-cast treasures.';
  const heroBanner = siteSettings?.hero_banner_url;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {heroBanner && (
          <div className="absolute inset-0">
            <img
              src={heroBanner}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/70 via-dark-950/80 to-dark-950" />
          </div>
        )}
        {!heroBanner && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-dark-950 to-dark-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-300">The #1 Hot Wheels Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
              <span className="text-white">{heroTitle.split(' ').slice(0, -1).join(' ') || 'Collect, Trade & Sell'}</span><br />
              <span className="text-gradient">{heroTitle.split(' ').slice(-1)[0] || 'Hot Wheels'}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up">
              <Link to="/marketplace" className="btn-primary text-lg px-8 py-4">
                Browse Marketplace<ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/sell" className="btn-secondary text-lg px-8 py-4">Start Selling</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-4 animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-16 bg-gradient-to-b from-dark-950 to-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-glow">
                  <Gavel className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-950 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Live Auctions</h2>
                <p className="text-gray-500">Bid on rare finds before time runs out</p>
              </div>
            </div>
            <Link to="/auctions" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium">
              View All<ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {auctionsLoading ? (
            <LoadingGrid count={3} />
          ) : auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((listing) => (
                <div key={listing.id} className="glass-card-hover featured-glow">
                  <ProductCard listing={listing} />
                  {listing.auction && (
                    <div className="mt-4 pt-4 border-t border-dark-700/50 px-1">
                      <div className="flex items-center justify-between">
                        <CountdownTimer endTime={listing.auction.end_time} variant="compact" />
                        <span className="text-xs text-gray-500">{listing.auction.bid_count} bids</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Gavel className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No live auctions at the moment</p>
              <Link to="/sell" className="btn-primary">Start an Auction</Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Featured Listings</h2>
              <p className="text-gray-500">Curated selection of premium collectibles</p>
            </div>
            <Link to="/marketplace" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium">
              View All<ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <LoadingGrid count={4} />
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No featured listings yet</p>
              <Link to="/marketplace" className="btn-primary">Browse All Listings</Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Browse by Category</h2>
            <p className="text-gray-500">Find exactly what you're looking for</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square glass-card skeleton" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="group glass-card-hover relative overflow-hidden aspect-square"
                >
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              [Shield, 'Secure Transactions', 'Buyer protection on every purchase.'],
              [Truck, 'Global Shipping', 'Sellers ship worldwide with tracking.'],
              [Star, 'Verified Sellers', 'Real reviews from real collectors.'],
            ].map(([Icon, title, desc], i) => (
              <div key={i} className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title as string}</h3>
                <p className="text-gray-400 text-sm">{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
