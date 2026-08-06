import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import clsx from 'clsx';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1, isAuthenticated);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product, isAuthenticated);
  };

  return (
    <Link to={`/product/${product.slug}`}
      className={clsx(
        'group block card overflow-hidden animate-fade-in',
        product.is_featured && !discount && 'ring-2 ring-primary-200'
      )}>
      {/* Image */}
      <div className="product-img-wrap">
        <img
          src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges — single pill top-left, no stacking */}
        <div className="absolute top-3 left-3">
          {product.stock_quantity === 0 ? (
            <span className="badge bg-gray-500/90 text-white backdrop-blur-sm">Out of Stock</span>
          ) : discount && product.is_featured ? (
            // Both: show combined single pill in orange
            <span className="badge text-white" style={{ background: 'var(--brand-secondary)' }}>
              ★ -{discount}%
            </span>
          ) : discount ? (
            <span className="badge text-white" style={{ background: 'var(--brand-secondary)' }}>
              -{discount}%
            </span>
          ) : product.is_featured ? (
            // Featured only: subtle border-glow instead of pill — handled on card outline
            null
          ) : null}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={clsx(
            'absolute top-3 right-3 w-8 h-8 rounded-full shadow flex items-center justify-center transition-all',
            isWishlisted
              ? 'bg-red-500 text-white opacity-100'
              : 'bg-white text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={15} className={isWishlisted ? 'fill-white' : ''} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar key={s} size={12}
                className={clsx(s <= Math.round(product.rating)
                  ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.review_count})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={clsx(
              'p-2.5 rounded-xl transition-all duration-200',
              product.stock_quantity === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
