import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, Pencil, Trash2, Search, LayoutDashboard,
  Users, ShoppingBag, X, Save, Star, AlertTriangle, ChevronUp, ChevronDown, Eye
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Clothing','Accessories','Furniture','Books','Sports','Wearables','Other'];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Electronics', brand: '', stock: '',
  images: '', featured: false, isActive: true,
  specifications: [{ key: '', value: '' }],
  tags: '',
};

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

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          images: Array.isArray(product.images) ? product.images.join('\n') : product.images || '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
          specifications: product.specifications?.length ? product.specifications : [{ key: '', value: '' }],
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const addSpec = () => setForm(p => ({ ...p, specifications: [...p.specifications, { key: '', value: '' }] }));
  const removeSpec = (i) => setForm(p => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }));
  const updateSpec = (i, field, val) => setForm(p => ({
    ...p,
    specifications: p.specifications.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.brand || !form.stock) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        stock: parseInt(form.stock),
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        specifications: form.specifications.filter(s => s.key && s.value),
      };

      if (product?._id) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto card animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <h2 className="font-display font-bold text-lg text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Phantom X Gaming Keyboard" required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Brand *</label>
              <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. PhantomTech" required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Price ($) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Original Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="Leave blank if no discount" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Stock Quantity *</label>
              <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="wireless, gaming, rgb" className="input-field" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Write a detailed product description..."
              required
              className="input-field resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Image URLs (one per line)</label>
            <textarea
              value={form.images}
              onChange={e => set('images', e.target.value)}
              rows={3}
              placeholder="https://images.unsplash.com/photo-xxx&#10;https://..."
              className="input-field resize-none font-mono text-xs"
            />
          </div>

          {/* Image Preview */}
          {form.images && (
            <div className="flex gap-2 flex-wrap">
              {form.images.split('\n').filter(Boolean).map((url, i) => (
                <img key={i} src={url.trim()} alt="" className="w-16 h-16 rounded-lg object-cover border border-dark-500"
                  onError={e => { e.target.style.display = 'none'; }} />
              ))}
            </div>
          )}

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Specifications</label>
              <button type="button" onClick={addSpec} className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={spec.key}
                    onChange={e => updateSpec(i, 'key', e.target.value)}
                    placeholder="Key (e.g. Battery Life)"
                    className="input-field flex-1 py-2 text-sm"
                  />
                  <input
                    value={spec.value}
                    onChange={e => updateSpec(i, 'value', e.target.value)}
                    placeholder="Value (e.g. 40 hours)"
                    className="input-field flex-1 py-2 text-sm"
                  />
                  <button type="button" onClick={() => removeSpec(i)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('featured', !form.featured)}
                className={`relative w-10 h-5 rounded-full transition-all ${form.featured ? 'bg-accent' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-slate-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('isActive', !form.isActive)}
                className={`relative w-10 h-5 rounded-full transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-slate-300">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-dark-600">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Save size={16} /> {product ? 'Save Changes' : 'Create Product'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      params.set('page', page);
      params.set('limit', 10);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, categoryFilter, page]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openCreate = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit   = (p) => { setEditProduct(p);  setModalOpen(true); };

  const sorted = [...products].sort((a, b) => {
    let aVal = a[sortField], bVal = b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} className="text-accent" /> : <ChevronDown size={13} className="text-accent" />
      : <ChevronDown size={13} className="text-slate-600" />
  );

  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Product <span className="text-accent">Management</span></h1>
            <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total products</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, brand..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-44"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 w-12">#</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors">
                      Product <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('price')} className="flex items-center gap-1 hover:text-white transition-colors">
                      Price <SortIcon field="price" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">
                    <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 hover:text-white transition-colors">
                      Stock <SortIcon field="stock" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Rating</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><LoadingSpinner text="Loading products..." /></td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-slate-600">No products found</td></tr>
                ) : sorted.map((product, idx) => (
                  <tr key={product._id} className="hover:bg-dark-700/40 transition-colors group">
                    <td className="px-4 py-3 text-slate-600 text-xs">{(page - 1) * 10 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge bg-dark-600 text-slate-300 border border-dark-500 text-[11px]">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">${product.price.toFixed(2)}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-slate-600 line-through">${product.originalPrice.toFixed(2)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`font-semibold text-sm ${
                        product.stock === 0 ? 'text-red-400' :
                        product.stock < 10 ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        {product.stock === 0 ? 'Out' : product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="star-filled" fill="currentColor" />
                        <span className="text-sm text-white">{product.rating?.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-slate-600">({product.rating?.count || 0})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {product.featured && (
                          <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px]">Featured</span>
                        )}
                        <span className={`badge border text-[10px] ${
                          product.isActive
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                            : 'bg-red-400/10 text-red-400 border-red-400/30'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/products/${product._id}`} target="_blank"
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-dark-600 rounded-lg transition-all" title="View">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => openEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-all" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(product._id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
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
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs transition-all ${page === p ? 'bg-accent text-white' : 'bg-dark-700 text-slate-400 hover:bg-dark-600'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => setModalOpen(false)}
          onSave={fetchProducts}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full animate-fade-in">
            <div className="w-12 h-12 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Delete Product?</h3>
            <p className="text-slate-500 text-sm mb-6">This action will deactivate the product. It won't be visible to customers.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}