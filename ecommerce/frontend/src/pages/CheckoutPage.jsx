import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, CheckCircle, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => n < step && setStep(n)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= n ? 'bg-accent text-white' : 'bg-dark-700 text-slate-500'
              }`}
            >
              {step > n ? <CheckCircle size={16} /> : n}
            </button>
            <span className={`text-sm ${step >= n ? 'text-white' : 'text-slate-600'}`}>{label}</span>
            {n < 3 && <div className={`flex-1 h-px w-8 ${step > n ? 'bg-accent' : 'bg-dark-600'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5 flex items-center gap-2"><MapPin size={18} className="text-accent" /> Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                  <input value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-slate-400 mb-1.5 block">Street Address</label>
                  <input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="123 Main St" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">City</label>
                  <input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="New York" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">State</label>
                  <input value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} placeholder="NY" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">ZIP Code</label>
                  <input value={address.zipCode} onChange={e => setAddress(p => ({ ...p, zipCode: e.target.value }))} placeholder="10001" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Country</label>
                  <input value={address.country} onChange={e => setAddress(p => ({ ...p, country: e.target.value }))} placeholder="US" className="input-field" />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full">Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5 flex items-center gap-2"><CreditCard size={18} className="text-accent" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                  { value: 'credit_card', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
                  { value: 'paypal', label: 'PayPal', desc: 'Secure PayPal checkout' },
                  { value: 'stripe', label: 'Stripe', desc: 'Fast, secure payments' },
                ].map(option => (
                  <label key={option.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === option.value ? 'border-accent bg-accent/10' : 'border-dark-600 hover:border-dark-400'
                  }`}>
                    <input type="radio" name="payment" value={option.value} checked={paymentMethod === option.value} onChange={e => setPaymentMethod(e.target.value)} className="accent-accent" />
                    <div>
                      <p className="font-medium text-white text-sm">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5 flex items-center gap-2"><Package size={18} className="text-accent" /> Review Order</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 py-2 border-b border-dark-600 last:border-0">
                    <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-dark-700" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-dark-700 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-500 mb-1">Shipping to:</p>
                <p className="text-sm text-white">{address.name} — {address.street}, {address.city}, {address.zipCode}</p>
                <p className="text-xs text-slate-500 mt-2">Payment: <span className="text-slate-300">{paymentMethod.toUpperCase()}</span></p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Place Order 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-white mb-4">Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span className={shipping === 0 ? 'text-emerald-400' : 'text-white'}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tax</span><span className="text-white">${tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-dark-600 pt-3 flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-accent text-lg">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}