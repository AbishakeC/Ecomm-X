import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@nexshop.com', password: 'admin123' });
    else setForm({ email: 'user@nexshop.com', password: 'user123' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-900/10 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="card p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center glow-accent">
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-widest">NEX<span className="text-accent">SHOP</span></span>
            </Link>
            <h2 className="text-xl font-semibold text-white mt-4 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account</p>
          </div>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('admin')} className="flex-1 text-xs py-2 px-3 bg-accent/10 border border-accent/30 text-accent rounded-lg hover:bg-accent/20 transition-all">
              👑 Admin Demo
            </button>
            <button onClick={() => fillDemo('user')} className="flex-1 text-xs py-2 px-3 bg-dark-700 border border-dark-500 text-slate-400 rounded-lg hover:bg-dark-600 hover:text-white transition-all">
              👤 User Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:text-accent-light font-medium transition-colors">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}