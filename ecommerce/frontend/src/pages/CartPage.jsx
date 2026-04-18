import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-dark-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingCart size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Shopping <span className="gradient-text">Cart</span></h1>
        <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex gap-4 animate-fade-in">
              <Link to={`/products/${item._id}`} className="flex-shrink-0 w-24 h-24 bg-dark-700 rounded-xl overflow-hidden">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`} className="font-semibold text-white hover:text-accent transition-colors line-clamp-2 text-sm">
                  {item.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{item.brand}</p>
                <p className="text-accent font-bold mt-2">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => { removeFromCart(item._id); toast.success('Removed from cart'); }} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center bg-dark-700 border border-dark-500 rounded-lg overflow-hidden">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
                    <Plus size={13} />
                  </button>
                </div>
                <p className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-white text-lg mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <span className="text-white">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Shipping</span>
              <span className={shipping === 0 ? 'text-emerald-400 font-medium' : 'text-white'}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tax (8%)</span>
              <span className="text-white">${tax.toFixed(2)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-slate-500 bg-dark-700 px-3 py-2 rounded-lg">Add ${(100 - cartTotal).toFixed(2)} more for free shipping</p>
            )}
          </div>
          <div className="border-t border-dark-600 pt-4 mb-6">
            <div className="flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-xl text-accent">${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
            Checkout <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}