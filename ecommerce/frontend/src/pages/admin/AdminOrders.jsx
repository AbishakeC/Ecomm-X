import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Eye, Truck, X, Save, ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function AdminNav() {
  return (
    <div className="border-b border-dark-600/50 bg-dark-900/80 backdrop-blur sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-6 overflow-x-auto">
        {[
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/products', label: 'Products', icon: Package },
          { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
          { to: '/admin/users', label: 'Users', icon: Users },
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
  );
}

function OrderDetailModal({ order, onClose, onSaved }) {
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/orders/${order._id}/status`, {
        orderStatus,
        paymentStatus,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      toast.success('Order updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto card animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <h2 className="font-display font-bold text-lg text-white">Order details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="font-mono text-slate-400">{order._id}</span>
            <span>·</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          {order.user && (
            <div className="bg-dark-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customer</p>
              <p className="text-white font-medium">{order.user.name}</p>
              <p className="text-sm text-slate-400">{order.user.email}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Items</p>
            <ul className="space-y-2">
              {order.items?.map((line, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm border border-dark-600 rounded-lg px-3 py-2">
                  <span className="text-slate-200 truncate">{line.name} × {line.quantity}</span>
                  <span className="text-white font-medium shrink-0">${(line.price * line.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {order.shippingAddress && (
            <div className="bg-dark-700/50 rounded-xl p-4 text-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Ship to</p>
              <p className="text-white">{order.shippingAddress.name}</p>
              <p className="text-slate-400">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Order status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="input-field py-2 text-sm"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Payment</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="input-field py-2 text-sm"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Tracking number</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Carrier tracking ID"
              className="input-field py-2 text-sm"
            />
          </div>

          <div className="flex justify-between text-sm border-t border-dark-600 pt-4">
            <span className="text-slate-500">Total</span>
            <span className="text-lg font-bold text-white">${order.total?.toFixed(2)}</span>
          </div>

          <form onSubmit={handleSave} className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} /> Save
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailOrder, setDetailOrder] = useState(null);
  const limit = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders || []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Order <span className="text-accent">management</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{total} total orders</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-48 py-2 text-sm self-start sm:self-auto"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Payment</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <LoadingSpinner text="Loading orders..." />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-600">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-dark-700/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-400 truncate max-w-[140px]">{o._id}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-white text-sm">{o.user?.name || '—'}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{o.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">${o.total?.toFixed(2)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="badge border text-[10px] bg-dark-600 text-slate-300 border-dark-500 capitalize">
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge border text-[10px] capitalize ${
                            o.orderStatus === 'delivered'
                              ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                              : o.orderStatus === 'cancelled'
                                ? 'bg-red-400/10 text-red-400 border-red-400/30'
                                : 'bg-dark-600 text-slate-300 border-dark-500'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailOrder(o)}
                          className="p-1.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-all inline-flex items-center gap-1"
                          title="View / update"
                        >
                          <Eye size={14} />
                          <Truck size={14} className="hidden sm:inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 inline-flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 inline-flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onSaved={fetchOrders}
        />
      )}
    </div>
  );
}
