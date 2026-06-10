import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Lock, ChevronRight, Check, MapPin, Truck, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, cn } from '../lib/utils';

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment' | 'complete'>('shipping');
  const [loading, setLoading] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    firstName: profile?.display_name?.split(' ')[0] || '', lastName: profile?.display_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '', address: '', city: '', state: '', zipCode: '', country: 'US',
  });

  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvc: '' });

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('complete');
    clearCart();
    setLoading(false);
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-400" /></div>
            <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-gray-400 mb-6">Thank you for your purchase.</p>
            <div className="flex gap-3">
              <Link to="/dashboard" className="btn-primary flex-1">View Orders</Link>
              <Link to="/marketplace" className="btn-secondary flex-1">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['shipping', 'payment'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
                step === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' :
                s === 'shipping' && step === 'payment' ? 'text-green-400' : 'text-gray-500')}>
                <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                  step === s ? 'bg-primary-500 text-white' :
                  s === 'shipping' && step === 'payment' ? 'bg-green-500 text-white' : 'bg-dark-800 text-gray-500')}>
                  {s === 'shipping' && step === 'payment' ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className="hidden sm:block capitalize">{s}</span>
              </div>
              {i === 0 && <ChevronRight className="w-4 h-4 text-gray-600 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><MapPin className="w-6 h-6 text-primary-400" />Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">First Name</label><input type="text" value={shippingForm.firstName} onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label><input type="text" value={shippingForm.lastName} onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })} className="input" /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-2">Email</label><input type="email" value={shippingForm.email} onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })} className="input" /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label><input type="text" value={shippingForm.address} onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">City</label><input type="text" value={shippingForm.city} onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">State</label><input type="text" value={shippingForm.state} onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label><input type="text" value={shippingForm.zipCode} onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })} className="input" /></div>
                </div>
                <div className="flex justify-end mt-8"><button onClick={() => setStep('payment')} className="btn-primary">Continue to Payment<ChevronRight className="w-4 h-4" /></button></div>
              </div>
            )}
            {step === 'payment' && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><CreditCard className="w-6 h-6 text-primary-400" />Payment Method</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label><div className="relative"><input type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19) })} className="input pl-12" placeholder="1234 5678 9012 3456" /><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label><input type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })} className="input" placeholder="John Doe" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label><input type="text" value={paymentForm.expiry} onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5) })} className="input" placeholder="MM/YY" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2">CVC</label><input type="text" value={paymentForm.cvc} onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="input" placeholder="123" /></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 text-sm text-gray-400"><Lock className="w-4 h-4 text-green-400" /><span>Your payment is secured with 256-bit SSL encryption</span></div>
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep('shipping')} className="btn-ghost">Back to Shipping</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary">{loading ? 'Processing...' : `Place Order - ${formatPrice(orderTotal)}`}</button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">{items.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.listing.primary_image || item.listing.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{item.listing.title}</p></div>
                  <p className="text-sm text-white">{formatPrice(item.listing.price * item.quantity)}</p>
                </div>
              ))}
              {items.length > 3 && <p className="text-sm text-gray-400 text-center">+{items.length - 3} more items</p>}</div>
              <div className="space-y-3 pb-4 border-b border-dark-700">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">{formatPrice(total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Shipping</span><span className={cn(shipping === 0 && 'text-green-400')}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span className="text-white">{formatPrice(tax)}</span></div>
              </div>
              <div className="flex justify-between text-lg font-bold py-4"><span className="text-white">Total</span><span className="text-primary-400">{formatPrice(orderTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
