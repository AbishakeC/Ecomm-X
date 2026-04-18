import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Truck, Shield, Package, Plus, Minus, Check, Zap } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading product..." /></div>;
  if (!product) return <div className="text-center py-20 text-slate-500">Product not found</div>;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-accent mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="card overflow-hidden aspect-square mb-3">
            <img
              src={product.images?.[activeImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-accent' : 'border-dark-600 hover:border-dark-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-accent/20 text-accent border border-accent/30">{product.category}</span>
            {product.featured && (
              <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <Zap size={10} fill="currentColor" /> Featured
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">-{discount}% OFF</span>
            )}
          </div>

          <p className="text-accent font-medium text-sm mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(product.rating?.average || 0) ? 'star-filled' : 'star-empty'} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-white font-medium">{product.rating?.average}</span>
            <span className="text-sm text-slate-500">({product.rating?.count?.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-white">${product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xl text-slate-500 line-through">${product.originalPrice?.toFixed(2)}</span>
            )}
          </div>

          <p className="text-slate-400 leading-relaxed mb-8">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center bg-dark-700 border border-dark-500 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : product.stock === 0
                  ? 'bg-dark-600 text-slate-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Truck, text: 'Free Shipping' },
              { icon: Shield, text: 'Warranty' },
              { icon: Package, text: 'Easy Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 bg-dark-800 border border-dark-600 rounded-xl text-center">
                <Icon size={18} className="text-accent" />
                <span className="text-xs text-slate-400">{text}</span>
              </div>
            ))}
          </div>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Specifications</h3>
              <div className="space-y-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-dark-600 last:border-0">
                    <span className="text-sm text-slate-500">{spec.key}</span>
                    <span className="text-sm text-slate-200 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="mt-8 pt-8 border-t border-dark-600">
          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-dark-700 text-slate-400 text-xs rounded-full border border-dark-500">#{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}