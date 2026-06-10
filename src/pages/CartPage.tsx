import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Shield, Truck, Tag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, cn } from '../lib/utils';

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-6"><ShoppingBag className="w-12 h-12 text-gray-600" /></div>
          <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-8">Looks like you have not added any Hot Wheels yet.</p>
          <Link to="/marketplace" className="btn-primary">Browse Marketplace<ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-display font-bold text-white">Shopping Cart</h1><p className="text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p></div>
          <button onClick={() => clearCart()} className="text-sm text-red-400 hover:text-red-300">Clear Cart</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-4">
                <div className="flex gap-4">
                  <Link to={`/listing/${item.listing.id}`} className="w-24 h-24 flex-shrink-0"><img src={item.listing.primary_image || item.listing.images?.[0]} alt={item.listing.title} className="w-full h-full object-cover rounded-lg" /></Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listing/${item.listing.id}`} className="font-semibold text-white hover:text-primary-400 line-clamp-1">{item.listing.title}</Link>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1"><span>{item.listing.brand}</span>{item.listing.series && <><span>•</span><span>{item.listing.series}</span></>}</div>
                    <div className="flex items-center gap-3 mt-3">
                      {item.listing.quantity > 1 && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.listing.id, item.quantity - 1)} className="btn-icon bg-dark-800"><Minus className="w-4 h-4" /></button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.listing.id, item.quantity + 1)} disabled={item.quantity >= item.listing.quantity} className="btn-icon bg-dark-800 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right"><p className="text-xl font-bold text-white mb-2">{formatPrice(item.listing.price * item.quantity)}</p><button onClick={() => removeItem(item.listing.id)} className="btn-icon text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Promo Code</label>
                <div className="flex gap-2"><input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" className="input flex-1" /><button onClick={() => { if (promoCode.toLowerCase() === 'wheels10') setDiscount(total * 0.1); }} className="btn-secondary"><Tag className="w-4 h-4" />Apply</button></div>
              </div>
              <div className="space-y-3 pb-4 border-b border-dark-700">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">{formatPrice(total)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span className={cn(shipping === 0 && 'text-green-400')}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Tax</span><span className="text-white">{formatPrice(tax)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              </div>
              <div className="flex justify-between text-lg font-bold py-4"><span className="text-white">Total</span><span className="text-primary-400">{formatPrice(orderTotal)}</span></div>
              <button onClick={() => { if (!user) navigate('/signin'); else navigate('/checkout'); }} className="btn-primary w-full mb-4"><CreditCard className="w-5 h-5" />Checkout</button>
              <Link to="/marketplace" className="btn-ghost w-full justify-center">Continue Shopping</Link>
              <div className="mt-6 pt-6 border-t border-dark-700 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400"><Shield className="w-5 h-5 text-primary-400" /><span>Buyer Protection Included</span></div>
                <div className="flex items-center gap-3 text-sm text-gray-400"><Truck className="w-5 h-5 text-primary-400" /><span>Free shipping over $100</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
