import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, DollarSign,
  TrendingUp, AlertTriangle, ArrowRight, CheckCircle, Clock,
  Truck, XCircle, BarChart3, Activity
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_CONFIG = {
  pending:    { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',  label: 'Pending' },
  confirmed:  { color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',        label: 'Confirmed' },
  processing: { color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',  label: 'Processing' },
  shipped:    { color: 'text-accent bg-accent/10 border-accent/30',               label: 'Shipped' },
  delivered:  { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',label: 'Delivered' },
  cancelled:  { color: 'text-red-400 bg-red-400/10 border-red-400/30',           label: 'Cancelled' },
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString(),
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
      iconColor: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Products',
      value: (stats?.totalProducts || 0).toLocaleString(),
      icon: Package,
      color: 'from-accent/20 to-purple-500/20 border-accent/30',
      iconColor: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Total Customers',
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      iconColor: 'text-pink-400',
      bg: 'bg-pink-400/10',
    },
  ];

  // Build bar chart data from monthlySales
  const monthlySales = stats?.monthlySales || [];
  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue), 1);

  // Order status breakdown
  const orderStatusStats = stats?.orderStatusStats || [];

  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      {/* Admin Topbar */}
      <div className="border-b border-dark-600/50 bg-dark-900/80 backdrop-blur sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-6 overflow-x-auto">
          {[
            { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
            { to: '/admin/products', label: 'Products',   icon: Package },
            { to: '/admin/orders',   label: 'Orders',     icon: ShoppingBag },
            { to: '/admin/users',    label: 'Users',      icon: Users },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap pb-0.5 border-b-2 transition-all ${
                window.location.pathname === to
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              Admin <span className="text-accent">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back — here's what's happening today</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full">
            <Activity size={13} className="text-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, iconColor, bg }) => (
            <div key={label} className={`card p-5 bg-gradient-to-br ${color} animate-fade-in`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <TrendingUp size={14} className="text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Revenue Bar Chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-accent" /> Monthly Revenue
              </h2>
              <span className="text-xs text-slate-500">Last 6 months</span>
            </div>
            {monthlySales.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No sales data yet</div>
            ) : (
              <div className="flex items-end gap-3 h-44">
                {monthlySales.map((month, i) => {
                  const heightPct = (month.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '140px' }}>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-700 border border-dark-500 text-xs text-white px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          ${month.revenue.toFixed(0)} · {month.orders} orders
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-accent to-accent-light rounded-t-lg transition-all duration-500 hover:from-accent-dark hover:to-accent"
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{MONTH_NAMES[(month._id.month - 1)]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-accent" /> Order Status
            </h2>
            {orderStatusStats.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {orderStatusStats.map(({ _id: status, count }) => {
                  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                  const total = orderStatusStats.reduce((a, s) => a + s.count, 0);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`badge border text-[11px] ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-accent" /> Recent Orders
              </h2>
              <Link to="/admin/orders" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {(stats?.recentOrders || []).length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {(stats?.recentOrders || []).map(order => {
                  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                  return (
                    <div key={order._id} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{order.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">${order.total?.toFixed(2)}</p>
                        <span className={`badge border text-[10px] ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Products */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-400" /> Low Stock Alert
              </h2>
              <Link to="/admin/products" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            {(stats?.lowStockProducts || []).length === 0 ? (
              <div className="text-center py-8 text-emerald-400/60 text-sm flex flex-col items-center gap-2">
                <CheckCircle size={32} className="text-emerald-500/40" />
                All products are well-stocked!
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.lowStockProducts || []).map(product => (
                  <div key={product._id} className="flex items-center gap-3 p-3 bg-orange-400/5 border border-orange-400/10 rounded-xl hover:border-orange-400/30 transition-all">
                    <div className="w-8 h-8 bg-orange-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`badge border text-[11px] font-bold ${
                        product.stock === 0
                          ? 'text-red-400 bg-red-400/10 border-red-400/30'
                          : 'text-orange-400 bg-orange-400/10 border-orange-400/30'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { to: '/admin/products', icon: Package,    label: 'Manage Products', desc: 'Add, edit or remove products', color: 'hover:border-accent/40' },
            { to: '/admin/orders',   icon: ShoppingBag, label: 'Manage Orders',   desc: 'Update order statuses',     color: 'hover:border-blue-400/40' },
            { to: '/admin/users',    icon: Users,       label: 'Manage Users',    desc: 'View and control accounts', color: 'hover:border-pink-400/40' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className={`card p-4 flex items-center gap-4 group transition-all ${color}`}>
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-all flex-shrink-0">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-accent ml-auto transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}