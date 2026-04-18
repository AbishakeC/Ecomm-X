import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-accent bg-accent/10 border-accent/30', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-400 bg-red-400/10 border-red-400/30', label: 'Cancelled' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading orders..." /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">My <span className="gradient-text">Orders</span></h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={60} className="text-dark-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-slate-500">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <div key={order._id} className="card p-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge border ${status.color}`}>
                      <StatusIcon size={11} /> {status.label}
                    </span>
                    <span className="text-lg font-bold text-accent">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-dark-700"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {order.trackingNumber && (
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <p className="text-xs text-slate-500">Tracking: <span className="font-mono text-accent">{order.trackingNumber}</span></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}