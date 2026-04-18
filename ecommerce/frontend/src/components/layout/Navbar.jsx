import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Zap, LogOut, Settings, Package, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:glow-accent transition-all">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-widest">NEX<span className="text-accent">SHOP</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-accent/20 text-accent'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-accent/20 text-accent'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <Link to="/products" className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all">
              <Search size={20} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-700 transition-all"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-dark-500"
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-dark-600">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700 hover:text-white transition-all">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700 hover:text-white transition-all">
                        <Package size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-dark-700 transition-all">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-dark-700 transition-all">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-accent hover:bg-dark-700 transition-all">
              Admin Panel
            </Link>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary py-2 text-sm text-center">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary py-2 text-sm text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}