import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = ['All', 'Electronics', 'Wearables', 'Accessories', 'Furniture', 'Clothing', 'Sports', 'Books', 'Other'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured First' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || 'default',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All') params.set('category', filters.category);
      if (filters.sort !== 'default') params.set('sort', filters.sort);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      params.set('page', filters.page);
      params.set('limit', '12');

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'All', sort: 'default', minPrice: '', maxPrice: '', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.category !== 'All' || filters.minPrice || filters.maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">All <span className="gradient-text">Products</span></h1>
        <p className="text-slate-500 text-sm">{pagination.total || 0} products available</p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search products, brands..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value)}
          className="input-field sm:w-48"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-accent text-accent' : ''}`}
        >
          <SlidersHorizontal size={16} /> Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      filters.category === cat
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'border-dark-500 text-slate-400 hover:border-accent/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {/* Price Range */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Min Price ($)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Max Price ($)</label>
              <input
                type="number"
                placeholder="9999"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Category pills (always visible) */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => updateFilter('category', cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filters.category === cat
                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                : 'bg-dark-700 text-slate-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" text="Loading products..." /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page <= 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      filters.page === p ? 'bg-accent text-white' : 'bg-dark-700 text-slate-400 hover:bg-dark-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page >= pagination.pages}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}