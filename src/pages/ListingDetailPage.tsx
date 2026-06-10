import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Flag, ChevronLeft, ChevronRight, Check, Star, MessageSquare, Package, Truck, Shield, Clock, Gavel, ShoppingCart, User, Loader2 } from 'lucide-react';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { ProductCard } from '../components/ui/ProductCard';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useListing, useListings } from '../lib/useData';
import { formatPrice, formatDate, getRarityLabel, getConditionLabel, cn } from '../lib/utils';

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  const { listing, loading, error } = useListing(id);
  const { listings: similarListings } = useListings({ limit: 4, sortBy: 'popular' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Listing not found</h2>
          <p className="text-gray-400 mb-4">{error || 'This listing may have been removed.'}</p>
          <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
        </div>
      </div>
    );
  }

  const isAuction = listing.listing_type === 'auction' || listing.listing_type === 'both';
  const canBuyNow = listing.listing_type === 'fixed' || (listing.listing_type === 'both' && listing.auction?.buy_now_price);
  const minBid = listing.auction ? listing.auction.current_price + listing.auction.minimum_bid_increment : listing.price;
  const images = listing.images?.length > 0 ? listing.images : [listing.primary_image || 'https://images.pexels.com/photos/1103826/pexels-photo-1103826.jpeg?auto=compress&cs=tinysrgb&w=800'];

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/marketplace" className="text-gray-400 hover:text-white">Marketplace</Link>
          <span className="text-gray-600">/</span>
          {listing.brand && (
            <>
              <Link to={`/marketplace?brand=${listing.brand}`} className="text-gray-400 hover:text-white">{listing.brand}</Link>
              <span className="text-gray-600">/</span>
            </>
          )}
          <span className="text-primary-400 truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square glass-card overflow-hidden rounded-2xl">
              <img src={images[currentImageIndex]} alt={listing.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 btn-icon bg-dark-900/80 backdrop-blur">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 btn-icon bg-dark-900/80 backdrop-blur">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {listing.featured && <span className="badge-primary">Featured</span>}
                {listing.rarity && <span className="badge bg-primary-500/20 text-primary-400">{getRarityLabel(listing.rarity)}</span>}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                      i === currentImageIndex ? 'border-primary-500' : 'border-transparent hover:border-dark-600'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-white mb-4">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {listing.brand && <span>{listing.brand}</span>}
                {listing.series && <><span>•</span><span>{listing.series}</span></>}
                {listing.year_released && <><span>•</span><span>{listing.year_released}</span></>}
                <span>•</span>
                <span>{getConditionLabel(listing.condition)}</span>
              </div>
            </div>

            {/* Auction */}
            {isAuction && listing.auction && (
              <div className="glass-card p-6 mb-6 auction-live">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">Live Auction</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Bid</p>
                    <p className="text-3xl font-bold text-white">{formatPrice(listing.auction.current_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Time Left</p>
                    <CountdownTimer endTime={listing.auction.end_time} variant="compact" className="text-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span>{listing.auction.bid_count} bids</span>
                  <span>•</span>
                  <span>Started at {formatPrice(listing.auction.starting_price)}</span>
                </div>
                <button
                  onClick={() => { if (!user) navigate('/signin'); else setShowBidModal(true); }}
                  className="btn-primary w-full text-lg mb-3"
                >
                  <Gavel className="w-5 h-5" />Place Bid
                </button>
                {listing.auction.buy_now_price && (
                  <button onClick={() => addItem(listing)} className="btn-secondary w-full">
                    Buy Now for {formatPrice(listing.auction.buy_now_price)}
                  </button>
                )}
              </div>
            )}

            {/* Fixed Price */}
            {canBuyNow && !isAuction && (
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-white">{formatPrice(listing.price)}</p>
                    {listing.original_price && listing.original_price > listing.price && (
                      <p className="text-gray-500 line-through">{formatPrice(listing.original_price)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>{listing.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => addItem(listing)}
                    disabled={listing.quantity < 1}
                    className="btn-primary flex-1"
                  >
                    <ShoppingCart className="w-5 h-5" />Add to Cart
                  </button>
                  <button onClick={() => setShowOfferModal(true)} className="btn-secondary">
                    Make Offer
                  </button>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                [Package, 'Condition', getConditionLabel(listing.condition)],
                [Shield, 'Packaging', listing.packaging || 'N/A'],
                [Truck, 'Scale', listing.scale || '1:64'],
                [Clock, 'Listed', formatDate(listing.created_at)],
              ].map(([Icon, label, value], i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary-400" />
                    <span className="text-gray-400">{label as string}</span>
                  </div>
                  <p className="text-white font-semibold">{value as string}</p>
                </div>
              ))}
            </div>

            {/* Seller */}
            {listing.seller && (
              <div className="glass-card p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center">
                    {listing.seller.avatar_url ? (
                      <img src={listing.seller.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/profile/${listing.seller.username}`}
                        className="font-semibold text-white hover:text-primary-400"
                      >
                        {listing.seller.display_name || listing.seller.username}
                      </Link>
                      {listing.seller.is_verified && (
                        <span className="text-primary-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {listing.seller.seller_rating?.toFixed(1) || 'N/A'}
                      </span>
                      <span>{listing.seller.total_sales || 0} sales</span>
                      {listing.seller.location && <span>{listing.seller.location}</span>}
                    </div>
                  </div>
                  <button className="btn-secondary">
                    <MessageSquare className="w-4 h-4" />Message
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <div className="text-gray-300 whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similarListings.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Similar Listings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarListings.filter(l => l.id !== listing.id).slice(0, 4).map(l => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bid Modal */}
      <Modal isOpen={showBidModal} onClose={() => setShowBidModal(false)} title="Place Your Bid" size="sm">
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-1">Current bid</p>
            <p className="text-2xl font-bold text-white">{formatPrice(listing.auction?.current_price || 0)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your bid (minimum {formatPrice(minBid)})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={minBid.toString()}
                className="input pl-8"
                min={minBid}
                step={listing.auction?.minimum_bid_increment || 1}
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setShowBidModal(false)} className="btn-secondary">Cancel</button>
          <button className="btn-primary">Place Bid</button>
        </ModalFooter>
      </Modal>

      {/* Offer Modal */}
      <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Make an Offer" size="sm">
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-1">Asking price</p>
            <p className="text-2xl font-bold text-white">{formatPrice(listing.price)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your offer</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="input pl-8"
                min={1}
                max={listing.price}
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setShowOfferModal(false)} className="btn-secondary">Cancel</button>
          <button className="btn-primary">Send Offer</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
