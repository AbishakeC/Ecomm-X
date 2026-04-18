import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-600/50 bg-dark-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-widest">NEX<span className="text-accent">SHOP</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Premium e-commerce platform built for the future. Discover cutting-edge products at competitive prices.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Github, Instagram, Mail].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-dark-700 hover:bg-accent/20 hover:text-accent border border-dark-500 hover:border-accent/50 rounded-lg flex items-center justify-center text-slate-400 transition-all duration-200">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {['Products', 'Electronics', 'Accessories', 'Wearables', 'Furniture'].map(item => (
                <li key={item}>
                  <Link to="/products" className="text-sm text-slate-500 hover:text-accent transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Account</h3>
            <ul className="space-y-2">
              {[['Profile', '/profile'], ['Orders', '/orders'], ['Cart', '/cart'], ['Login', '/login'], ['Sign Up', '/signup']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-600/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} NexShop. All rights reserved.</p>
          <p className="text-xs text-slate-600">Built with <span className="text-accent">♥</span> using MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}