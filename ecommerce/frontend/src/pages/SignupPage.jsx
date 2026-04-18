import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome to NexShop!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-900/10 pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center glow-accent">
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-widest">NEX<span className="text-accent">SHOP</span></span>
            </Link>
            <h2 className="text-xl font-semibold text-white mt-4 mb-1">Create your account</h2>
            <p className="text-slate-500 text-sm">Join thousands of happy shoppers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                required
                className="input-field"
              />
            </div>
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
                  placeholder="Min. 6 characters"
                  required
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-dark-600 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${strengthColor[strength]} transition-all duration-300`} style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                className={`input-field ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500/50' : ''}`}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}