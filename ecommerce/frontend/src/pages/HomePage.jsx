import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Zap, TrendingUp, Star } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = [
  { name: 'Electronics', icon: '⚡', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { name: 'Wearables', icon: '⌚', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
  { name: 'Accessories', icon: '🎒', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  { name: 'Furniture', icon: '🖥️', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
  { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(res => setFeatured(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full text-accent text-sm font-medium mb-8 animate-fade-in">
              <TrendingUp size={14} />
              New arrivals every week
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              THE FUTURE OF
              <br />
              <span className="gradient-text text-glow">SHOPPING</span>
              <br />
              <span className="text-slate-400 text-4xl sm:text-5xl lg:text-6xl">IS HERE.</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover premium tech, accessories, and lifestyle products curated for those who demand excellence.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/products" className="btn-primary flex items-center gap-2 text-base">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="btn-secondary flex items-center gap-2 text-base">
                <Zap size={18} className="text-accent" /> Featured Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-accent">{val}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-y border-dark-600/50 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Shop by <span className="gradient-text">Category</span></h2>
          <Link to="/products" className="text-sm text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(({ name, icon, color }) => (
            <Link
              key={name}
              to={`/products?category=${name}`}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${color} border hover:scale-105 transition-all duration-300 text-center`}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <p className="font-semibold text-white text-sm">{name}</p>
              <ArrowRight size={14} className="absolute top-4 right-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured <span className="gradient-text">Products</span></h2>
            <p className="text-slate-500 text-sm mt-1">Hand-picked by our experts</p>
          </div>
          <Link to="/products" className="text-sm text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
            All products <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading products..." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-accent/20 via-purple-600/20 to-pink-600/20 border border-accent/30 p-10 text-center">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to <span className="gradient-text">Upgrade?</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join thousands of satisfied customers. Free shipping on your first order.
            </p>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Create Free Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}