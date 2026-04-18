import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country }
      });
      const token = localStorage.getItem('token');
      login(res.data.user, token);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">My <span className="gradient-text">Profile</span></h1>

      {/* Avatar Card */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl border-2 border-accent/30"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className={`badge mt-2 ${user?.role === 'admin' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-dark-700 text-slate-400 border border-dark-500'}`}>
            <Shield size={10} /> {user?.role === 'admin' ? 'Administrator' : 'Customer'}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card p-6">
        <h3 className="font-semibold text-white text-lg mb-5">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block flex items-center gap-1"><User size={12} /> Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block flex items-center gap-1"><Mail size={12} /> Email (read-only)</label>
              <input value={user?.email} readOnly className="input-field opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block flex items-center gap-1"><Phone size={12} /> Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" className="input-field" />
            </div>
          </div>

          <div className="border-t border-dark-600 pt-4">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-1"><MapPin size={13} /> Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder="Street address" className="input-field" />
              </div>
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input-field" />
              <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="State" className="input-field" />
              <input value={form.zipCode} onChange={e => setForm(p => ({ ...p, zipCode: e.target.value }))} placeholder="ZIP Code" className="input-field" />
              <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}