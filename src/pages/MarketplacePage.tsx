import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Package } from 'lucide-react';
import { ProductCard } from '../components/ui/ProductCard';
import { LoadingGrid } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { useListings } from '../lib/useData';
import { formatPrice, getRarityLabel, cn } from '../lib/utils';

const filterOptions = {
  condition: ['mint', 'near_mint', 'excellent', 'good', 'fair', 'poor'],
  rarity: ['common', 'uncommon', 'rare', 'super_rare', 'chase', 'treasure_hunt', 'super_treasure_hunt'],
  brand: ['Hot Wheels', 'Matchbox', 'Johnny Lightning', 'Greenlight'],
  sortBy: ['newest', 'price_asc', 'price_desc', 'popular'],
};

export function MarketplacePage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    condition: selectedConditions[0] || undefined,
    rarity: selectedRarities[0] || undefined,
    brand: selectedBrands[0] || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
    sortBy,
    status: 'active',
  }), [searchQuery, selectedConditions, selectedRarities, selectedBrands, priceRange, sortBy]);

  const { listings, loading, error } = useListings(filters);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setSelectedConditions([]);
    setSelectedRarities([]);
    setSelectedBrands([]);
    setSortBy('newest');
  };

  const activeFiltersCount = [
    searchQuery,
    priceRange[0] > 0 || priceRange[1] < 10000,
    selectedConditions.length,
    selectedRarities.length,
    selectedBrands.length,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Browse Hot Wheels collectibles from sellers worldwide</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hot Wheels, brands, series..."
              className="input pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select w-48"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <button
              onClick={() => setShowFilters(true)}
              className={cn('btn-secondary', activeFiltersCount > 0 && 'border-primary-500/50')}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-500 text-xs rounded-full">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-400">Active filters:</span>
            {selectedRarities.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRarities(prev => prev.filter(x => x !== r))}
                className="badge-primary flex items-center gap-1"
              >
                {getRarityLabel(r)}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={clearAllFilters} className="text-sm text-primary-400 hover:text-primary-300">
              Clear all
            </button>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{listings.length}</span> results
          </p>
        </div>

        {loading ? (
          <LoadingGrid count={8} />
        ) : error ? (
          <div className="glass-card p-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No listings found</h3>
            <p className="text-gray-400 mb-4">Be the first to list an item!</p>
            <Link to="/sell" className="btn-primary">List an Item</Link>
          </div>
        )}
      </div>

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters" size="lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="input"
                  min={0}
                  max={priceRange[1]}
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="input"
                  min={priceRange[0]}
                />
              </div>
            </div>
          </div>

          {[
            ['Brand', filterOptions.brand, selectedBrands, setSelectedBrands],
            ['Rarity', filterOptions.rarity, selectedRarities, setSelectedRarities],
            ['Condition', filterOptions.condition, selectedConditions, setSelectedConditions],
          ].map(([title, options, selected, setSelected]) => (
            <div key={title as string}>
              <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
              <div className="flex flex-wrap gap-2">
                {(options as string[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => (setSelected as (prev: string[]) => string[])(prev =>
                      prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                    )}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      (selected as string[]).includes(opt)
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                        : 'bg-dark-800 border-dark-700 text-gray-300 hover:border-dark-600'
                    )}
                  >
                    {opt.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-dark-700">
          <button onClick={clearAllFilters} className="btn-ghost">Clear All</button>
          <button onClick={() => setShowFilters(false)} className="btn-primary">Apply Filters</button>
        </div>
      </Modal>
    </div>
  );
}
