import { Link } from 'react-router-dom';
import { Heart, Gavel, Package } from 'lucide-react';
import { formatPrice, getRarityLabel, getConditionLabel, cn } from '../../lib/utils';
import type { Listing } from '../../lib/supabase';
import { useState } from 'react';

interface ProductCardProps { listing: Listing; className?: string; }

export function ProductCard({ listing, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageSrc = listing.primary_image || listing.images?.[0] ||
    'https://images.pexels.com/photos/1103826/pexels-photo-1103826.jpeg?auto=compress&cs=tinysrgb&w=400';
  const isAuction = listing.listing_type === 'auction' || listing.listing_type === 'both';

  return (
    <Link to={`/listing/${listing.id}`} className={cn('glass-card-hover group relative flex flex-col', className)}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
        <img src={imageError ? 'https://images.pexels.com/photos/1103826/pexels-photo-1103826.jpeg?auto=compress&cs=tinysrgb&w=400' : imageSrc}
          alt={listing.title} className={cn('w-full h-full object-cover transition-transform duration-500', isHovered && 'scale-110')}
          onError={() => setImageError(true)} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {listing.featured && <span className="badge-primary">Featured</span>}
          {listing.rarity && <span className={`badge bg-${listing.rarity.replace(/_/g, '-')}/20 text-gray-300`}>{getRarityLabel(listing.rarity)}</span>}
        </div>
        {isAuction && listing.auction && (
          <div className="absolute top-3 right-3">
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
              listing.auction.status === 'live' ? 'bg-green-500/90 text-white animate-pulse' : 'bg-dark-900/90 text-gray-300')}>
              <Gavel className="w-3 h-3" />{listing.auction.status === 'live' ? 'LIVE' : 'AUCTION'}
            </div>
          </div>
        )}
        <button className="absolute bottom-3 right-3 btn-icon bg-dark-900/80 hover:bg-primary-600 opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => { e.preventDefault(); }}>
          <Heart className="w-5 h-5" />
        </button>
        <div className="absolute bottom-3 left-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Package className="w-3.5 h-3.5" />
            <span>{getConditionLabel(listing.condition)}</span>
            {listing.packaging && <><span>•</span><span>{listing.packaging}</span></>}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-1 pb-1">
        <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">{listing.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {listing.year_released && <span>{listing.year_released}</span>}
          {listing.series && <><span>•</span><span className="truncate">{listing.series}</span></>}
        </div>
        <div className="mt-auto">
          {isAuction && listing.auction ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Current Bid</p>
                  <p className="text-xl font-bold text-white">{formatPrice(listing.auction.current_price)}</p>
                </div>
                <span className="text-xs text-gray-400">{listing.auction.bid_count} bids</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">{formatPrice(listing.price)}</p>
              {listing.original_price && listing.original_price > listing.price &&
                <p className="text-sm text-gray-500 line-through">{formatPrice(listing.original_price)}</p>}
            </div>
          )}
        </div>
        {listing.seller && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-700/50">
            <div className="w-6 h-6 rounded bg-dark-700 flex items-center justify-center">
              {listing.seller.avatar_url ? <img src={listing.seller.avatar_url} alt="" className="w-6 h-6 rounded object-cover" />
                : <span className="text-[10px] font-bold text-gray-400">{listing.seller.username?.[0]?.toUpperCase()}</span>}
            </div>
            <span className="text-xs text-gray-400 truncate">{listing.seller.username}</span>
            {listing.seller.is_verified && <span className="text-primary-500 text-xs">✓</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
