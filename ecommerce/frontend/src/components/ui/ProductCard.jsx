import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="card card-hover group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-dark-700">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-accent text-white text-[10px]">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px]">
              <Zap size={9} fill="currentColor" /> Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">Out of Stock</span>
          )}
        </div>
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-accent hover:bg-accent-dark disabled:bg-dark-600 disabled:text-slate-500 text-white text-sm font-semibold py-3 flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingCart size={15} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-xs text-accent font-medium mb-0.5">{product.brand}</p>
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-accent-light transition-colors">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className={s <= Math.round(product.rating?.average || 0) ? 'star-filled' : 'star-empty'} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.rating?.count?.toLocaleString() || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">${product.price?.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-600 line-through">${product.originalPrice?.toFixed(2)}</span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-400 mt-1.5">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}