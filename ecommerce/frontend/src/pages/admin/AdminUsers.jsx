import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, LayoutDashboard,
  Search, Shield, UserCheck, UserX, Trash2, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, X, Mail, Phone, MapPin, Calendar, ShoppingCart
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function AdminNav() {
  return (
    <div className="border-b border-dark-600/50 bg-dark-900/80 backdrop-blur sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-6 overflow-x-auto">
        {[
          { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/products', label: 'Products',  icon: Package },
          { to: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
          { to: '/admin/users',    label: 'Users',     icon: Users },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap pb-0.5 border-b-2 transition-all ${
              window.location.pathname === to
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-white'
            }`}>
            <Icon size={14} /> {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function UserDetailModal({ user: u, onClose, onUpdated }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    // We can show the user's info; orders require a separate admin endpoint
    // For now we just display user details cleanly
  }, [u]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg card animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <h2 className="font-display font-bold text-lg text-white">User Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + basic */}
          <div className="flex items-center gap-4">
            <img
              src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
              alt={u.name}
              className="w-16 h-16 rounded-2xl border-2 border-dark-500 flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{u.name}</h3>
              <p className="text-slate-500 text-sm">{u.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge border text-[11px] ${
                  u.role === 'admin'
                    ? 'bg-accent/20 text-accent border-accent/30'
                    : 'bg-dark-600 text-slate-300 border-dark-500'
                }`}>
                  <Shield size={10} /> {u.role === 'admin' ? 'Administrator' : 'Customer'}
                </span>
                <span className={`badge border text-[11px] ${
                  u.isActive
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                    : 'bg-red-400/10 text-red-400 border-red-400/30'
                }`}>
                  {u.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Mail size={10} /> Email</p>
              <p className="text-sm text-white truncate">{u.email}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Phone size={10} /> Phone</p>
              <p className="text-sm text-white">{u.phone || '—'}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={10} /> Address</p>
              {u.address?.street ? (
                <p className="text-sm text-white">
                  {u.address.street}, {u.address.city}, {u.address.state} {u.address.zipCode}, {u.address.country}
                </p>
              ) : (
                <p className="text-sm text-slate-600">No address provided</p>
              )}
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Calendar size={10} /> Joined</p>
              <p className="text-sm text-white">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><ShoppingCart size={10} /> Wishlist</p>
              <p className="text-sm text-white">{u.wishlist?.length || 0} items</p>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={onClose} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const { user: currentUser } = useAuth();
  const LIMIT = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=${LIMIT}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleToggle = async (userId) => {
    if (userId === currentUser._id) {
      toast.error("You can't deactivate your own account");
      return;
    }
    try {
      const res = await api.put(`/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser._id) {
      toast.error("You can't delete your own account");
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} className="text-accent" /> : <ChevronDown size={13} className="text-accent" />
      : <ChevronDown size={13} className="text-slate-600" />
  );

  // Filter + sort on client side
  const filteredUsers = users
    .filter(u => {
      const matchSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'suspended' && !u.isActive);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      let aVal = sortField === 'name' ? a.name.toLowerCase() : new Date(a.createdAt);
      let bVal = sortField === 'name' ? b.name.toLowerCase() : new Date(b.createdAt);
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const pages = Math.ceil(total / LIMIT);

  // Summary counts
  const adminCount  = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">User <span className="text-accent">Management</span></h1>
            <p className="text-slate-500 text-sm mt-1">{total} registered accounts</p>
          </div>
          {/* Summary badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full">
              <Shield size={13} className="text-accent" />
              <span className="text-xs text-accent font-medium">{adminCount} Admin{adminCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full">
              <UserCheck size={13} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-400/10 border border-red-400/30 rounded-full">
              <UserX size={13} className="text-red-400" />
              <span className="text-xs text-red-400 font-medium">{total - activeCount} Suspended</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-10"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-36">
            <option value="all">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-40">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors">
                      User <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-white transition-colors">
                      Joined <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden xl:table-cell">Wishlist</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><LoadingSpinner text="Loading users..." /></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-slate-600">No users found</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u._id} className={`hover:bg-dark-700/40 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl border border-dark-500 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-white truncate">{u.name}</p>
                            {u._id === currentUser._id && (
                              <span className="text-[10px] text-accent">(you)</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge border text-[11px] ${
                        u.role === 'admin'
                          ? 'bg-accent/20 text-accent border-accent/30'
                          : 'bg-dark-600 text-slate-400 border-dark-500'
                      }`}>
                        <Shield size={10} /> {u.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge border text-[11px] ${
                        u.isActive
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                          : 'bg-red-400/10 text-red-400 border-red-400/30'
                      }`}>
                        {u.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-slate-400">{u.wishlist?.length || 0} items</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* View details */}
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Users size={14} />
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggle(u._id)}
                          disabled={u._id === currentUser._id}
                          className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            u.isActive
                              ? 'text-slate-500 hover:text-orange-400 hover:bg-orange-400/10'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10'
                          }`}
                          title={u.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(u._id)}
                          disabled={u._id === currentUser._id || u.role === 'admin'}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={u.role === 'admin' ? "Can't delete admin" : 'Delete User'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
              <p className="text-xs text-slate-500">
                Showing page {page} of {pages} ({total} users)
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs transition-all ${page === p ? 'bg-accent text-white' : 'bg-dark-700 text-slate-400 hover:bg-dark-600'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= pages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Legend / Tips */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><ToggleRight size={13} className="text-orange-400" /> Suspend/Activate user</p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Trash2 size={13} className="text-red-400/60" /> Delete (non-admin only)</p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Shield size={13} className="text-accent/60" /> Admin accounts cannot be deleted</p>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full animate-fade-in">
            <div className="w-12 h-12 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Delete User?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This action is permanent. The user's data will be removed. Their orders will be retained.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}