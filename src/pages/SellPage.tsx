import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Upload, X, Image, DollarSign, Package, Gavel, AlertCircle, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const steps = [
  { id: 1, title: 'Item Details', icon: Package },
  { id: 2, title: 'Images', icon: Image },
  { id: 3, title: 'Pricing', icon: DollarSign },
  { id: 4, title: 'Review', icon: Tag },
];

export function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', brand: 'Hot Wheels', series: '', year_released: '',
    color: '', rarity: '', condition: '', packaging: '',
    listing_type: 'fixed' as 'fixed' | 'auction' | 'both',
    price: '', original_price: '', starting_price: '', reserve_price: '', buy_now_price: '',
    auction_duration: '7', quantity: '1',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  const updateForm = (updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.title.trim()) newErrors.title = 'Title is required';
      if (!form.condition) newErrors.condition = 'Condition is required';
    }
    if (step === 2 && form.images.length === 0) newErrors.images = 'At least one image is required';
    if (step === 3) {
      if (form.listing_type === 'fixed' || form.listing_type === 'both') {
        if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
      }
      if (form.listing_type === 'auction' || form.listing_type === 'both') {
        if (!form.starting_price || parseFloat(form.starting_price) <= 0) {
          newErrors.starting_price = 'Starting price is required';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (files: FileList) => {
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      // In production, upload to Supabase Storage or Cloudinary
      // For now, create a local URL (this would be replaced with actual upload)
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(imageUrl);
    }

    if (newImages.length > 0) {
      updateForm({ images: [...form.images, ...newImages].slice(0, 10) });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!user) {
      navigate('/signin');
      return;
    }

    setSubmitting(true);

    try {
      // Create listing
      const listingData = {
        seller_id: user.id,
        title: form.title,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        brand: form.brand,
        series: form.series || null,
        year_released: form.year_released ? parseInt(form.year_released) : null,
        color: form.color || null,
        rarity: form.rarity || null,
        condition: form.condition as any,
        packaging: form.packaging as any || null,
        listing_type: form.listing_type,
        quantity: parseInt(form.quantity) || 1,
        images: form.images,
        primary_image: form.images[0] || null,
        status: 'active',
        published_at: new Date().toISOString(),
      };

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();

      if (listingError) throw listingError;

      // If auction, create auction record
      if ((form.listing_type === 'auction' || form.listing_type === 'both') && listing) {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (parseInt(form.auction_duration) * 24 * 60 * 60 * 1000));

        const auctionData = {
          listing_id: listing.id,
          starting_price: parseFloat(form.starting_price) || 0,
          current_price: parseFloat(form.starting_price) || 0,
          reserve_price: form.reserve_price ? parseFloat(form.reserve_price) : null,
          buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'live',
        };

        const { error: auctionError } = await supabase
          .from('auctions')
          .insert(auctionData);

        if (auctionError) throw auctionError;
      }

      setCreatedListingId(listing.id);
      setShowSuccess(true);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create listing' });
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Listing Created!</h2>
          <p className="text-gray-400 mb-6">Your item is now live and visible to buyers.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(createdListingId ? `/listing/${createdListingId}` : '/marketplace')}
              className="btn-primary"
            >
              View Listing
            </button>
            <button
              onClick={() => {
                setForm({
                  title: '', description: '', brand: 'Hot Wheels', series: '', year_released: '',
                  color: '', rarity: '', condition: '', packaging: '',
                  listing_type: 'fixed', price: '', original_price: '', starting_price: '',
                  reserve_price: '', buy_now_price: '', auction_duration: '7', quantity: '1', images: [],
                });
                setCurrentStep(1);
                setShowSuccess(false);
              }}
              className="btn-secondary"
            >
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-xl transition-colors',
                  currentStep === step.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : currentStep > step.id
                    ? 'text-green-400'
                    : 'text-gray-500'
                )}>
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    currentStep === step.id
                      ? 'bg-primary-500 text-white'
                      : currentStep > step.id
                      ? 'bg-green-500'
                      : 'bg-dark-800'
                  )}>
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium hidden sm:block">{step.title}</span>
                </div>
                {i < steps.length - 1 && <div className="w-12 h-px bg-dark-700 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          {errors.submit && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Step 1: Item Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Item Details</h2>
                <p className="text-gray-400">Tell us about your Hot Wheels collectible</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  placeholder="e.g., 1968 Redline Sweet 16 Classic Red"
                  className={cn('input', errors.title && 'border-red-500')}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => updateForm({ brand: e.target.value })}
                    className="select"
                  >
                    <option value="Hot Wheels">Hot Wheels</option>
                    <option value="Matchbox">Matchbox</option>
                    <option value="Johnny Lightning">Johnny Lightning</option>
                    <option value="Greenlight">Greenlight</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Series / Collection</label>
                  <input
                    type="text"
                    value={form.series}
                    onChange={(e) => updateForm({ series: e.target.value })}
                    placeholder="e.g., Redline, Super Treasure Hunt"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year Released</label>
                  <input
                    type="number"
                    value={form.year_released}
                    onChange={(e) => updateForm({ year_released: e.target.value })}
                    placeholder="1968"
                    className="input"
                    min="1968"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => updateForm({ color: e.target.value })}
                    placeholder="e.g., Spectraflame Red"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                  <select
                    value={form.rarity}
                    onChange={(e) => updateForm({ rarity: e.target.value })}
                    className="select"
                  >
                    <option value="">Select rarity</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="super_rare">Super Rare</option>
                    <option value="chase">Chase</option>
                    <option value="treasure_hunt">Treasure Hunt</option>
                    <option value="super_treasure_hunt">Super Treasure Hunt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Condition <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) => updateForm({ condition: e.target.value })}
                    className={cn('select', errors.condition && 'border-red-500')}
                  >
                    <option value="">Select condition</option>
                    <option value="mint">Mint - Perfect condition</option>
                    <option value="near_mint">Near Mint - Excellent, barely any wear</option>
                    <option value="excellent">Excellent - Minor wear</option>
                    <option value="good">Good - Some visible wear</option>
                    <option value="fair">Fair - Noticeable wear</option>
                    <option value="poor">Poor - Heavy wear</option>
                  </select>
                  {errors.condition && <p className="text-red-400 text-sm mt-1">{errors.condition}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Packaging</label>
                  <select
                    value={form.packaging}
                    onChange={(e) => updateForm({ packaging: e.target.value })}
                    className="select"
                  >
                    <option value="">Select packaging</option>
                    <option value="sealed">Sealed - Never opened</option>
                    <option value="opened">Opened - No original packaging</option>
                    <option value="carded">Carded - On original card</option>
                    <option value="blister_pack">Blister Pack</option>
                    <option value="loose">Loose - No packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Describe your item's condition, history, special features..."
                  className="textarea h-32"
                />
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Images</h2>
                <p className="text-gray-400">Add high-quality photos to attract buyers</p>
              </div>

              <label className={cn(
                'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                errors.images
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-dark-700 hover:border-primary-500/50 bg-dark-900/20'
              )}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-300 font-medium mb-1">Drop images here or click to upload</p>
                <p className="text-gray-500 text-sm">Max 10 images (5MB each)</p>
              </label>
              {errors.images && <p className="text-red-400 text-sm">{errors.images}</p>}

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative aspect-square glass overflow-hidden rounded-xl">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => updateForm({ images: form.images.filter((_, idx) => idx !== i) })}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {i === 0 && <div className="absolute bottom-2 left-2 badge-primary">Primary</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Pricing & Listing Type</h2>
                <p className="text-gray-400">Choose how you want to sell your item</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: 'fixed', label: 'Fixed Price', desc: 'Set a fixed price for instant purchase' },
                  { value: 'auction', label: 'Auction Only', desc: 'Let buyers bid on your item' },
                  { value: 'both', label: 'Both', desc: 'Accept bids and buy-now offers' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateForm({ listing_type: type.value as typeof form.listing_type })}
                    className={cn(
                      'glass-card-hover p-6 text-left',
                      form.listing_type === type.value && 'border-primary-500/50 bg-primary-500/5'
                    )}
                  >
                    <h3 className="font-semibold text-white mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-400">{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Fixed Price Settings */}
              {(form.listing_type === 'fixed' || form.listing_type === 'both') && (
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-400" />
                    Fixed Price Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => updateForm({ price: e.target.value })}
                          placeholder="0.00"
                          className={cn('input pl-8', errors.price && 'border-red-500')}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={form.original_price}
                          onChange={(e) => updateForm({ original_price: e.target.value })}
                          placeholder="0.00"
                          className="input pl-8"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Shows a discount if higher than price</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Auction Settings */}
              {(form.listing_type === 'auction' || form.listing_type === 'both') && (
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary-400" />
                    Auction Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Starting Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={form.starting_price}
                          onChange={(e) => updateForm({ starting_price: e.target.value })}
                          placeholder="0.00"
                          className={cn('input pl-8', errors.starting_price && 'border-red-500')}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.starting_price && <p className="text-red-400 text-sm mt-1">{errors.starting_price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Reserve Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={form.reserve_price}
                          onChange={(e) => updateForm({ reserve_price: e.target.value })}
                          placeholder="0.00"
                          className="input pl-8"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Item won't sell below this price</p>
                    </div>
                    {form.listing_type === 'both' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Buy Now Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={form.buy_now_price}
                            onChange={(e) => updateForm({ buy_now_price: e.target.value })}
                            placeholder="0.00"
                            className="input pl-8"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Auction Duration</label>
                      <select
                        value={form.auction_duration}
                        onChange={(e) => updateForm({ auction_duration: e.target.value })}
                        className="select"
                      >
                        <option value="1">1 Day</option>
                        <option value="3">3 Days</option>
                        <option value="5">5 Days</option>
                        <option value="7">7 Days</option>
                        <option value="10">10 Days</option>
                        <option value="14">14 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass p-6 rounded-xl">
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity Available</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => updateForm({ quantity: e.target.value })}
                  className="input w-32"
                  min="1"
                  max="999"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Review Your Listing</h2>
                <p className="text-gray-400">Make sure everything looks correct before publishing</p>
              </div>

              <div className="glass-card p-6">
                <div className="flex gap-6">
                  <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
                    {form.images[0] ? (
                      <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-12 h-12 text-gray-600 mx-auto mt-14" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{form.title || 'Untitled Listing'}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="badge">{form.brand}</span>
                      {form.rarity && <span className="badge-info">{form.rarity}</span>}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{form.description?.slice(0, 150)}...</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary-400">
                        ${parseFloat(form.price) || 0}
                      </span>
                      {(form.listing_type === 'auction' || form.listing_type === 'both') && (
                        <span className="text-gray-500">| Starting bid: ${parseFloat(form.starting_price) || 0}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-semibold text-white mb-4">Listing Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Condition:</span> <span className="ml-2 text-white">{form.condition}</span></div>
                  <div><span className="text-gray-400">Packaging:</span> <span className="ml-2 text-white">{form.packaging || 'N/A'}</span></div>
                  <div><span className="text-gray-400">Quantity:</span> <span className="ml-2 text-white">{form.quantity}</span></div>
                  <div><span className="text-gray-400">Listing Type:</span> <span className="ml-2 text-white capitalize">{form.listing_type}</span></div>
                  {form.year_released && <div><span className="text-gray-400">Year:</span> <span className="ml-2 text-white">{form.year_released}</span></div>}
                  <div><span className="text-gray-400">Images:</span> <span className="ml-2 text-white">{form.images.length}</span></div>
                </div>
              </div>

              <div className="glass p-4 rounded-xl border-yellow-500/30 bg-yellow-500/5">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">By publishing this listing, you agree to:</p>
                    <ul className="space-y-1 text-gray-400 list-disc list-inside">
                      <li>Sell the item exactly as described</li>
                      <li>Ship within 3 business days of payment</li>
                      <li>Respond to buyer messages promptly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
            {currentStep > 1 ? (
              <button onClick={prevStep} className="btn-ghost">
                <ChevronLeft className="w-4 h-4" />Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <button onClick={nextStep} className="btn-primary">
                Next Step<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
