import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import clsx from 'clsx';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, loading, fetchWishlist, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated]); // eslint-disable-line

  const handleMoveToCart = (product) => {
    addItem(product, 1, isAuthenticated);
    toggle(product, isAuthenticated);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title="My Wishlist"
        subtitle={items.length ? `${items.length} saved item${items.length !== 1 ? 's' : ''}` : undefined}
      >
        {items.length > 0 && (
          <Link to="/shop" className="btn-primary gap-2 text-sm py-2">
            Continue Shopping
          </Link>
        )}
      </PageHeader>

      <div className="container-page py-8 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon on any product."
            actionLabel="Browse Products"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const discount = product.original_price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : null;

              return (
                <div key={item.id} className="card overflow-hidden group animate-fade-in">
                  {/* Image */}
                  <Link to={`/product/${product.slug}`} className="block relative overflow-hidden bg-gray-50 aspect-square">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discount && (
                      <span className="absolute top-3 left-3 badge bg-accent-500 text-white">-{discount}%</span>
                    )}
                    {product.stock_quantity === 0 && (
                      <span className="absolute top-3 left-3 badge bg-gray-500 text-white">Out of Stock</span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    {product.category && (
                      <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
                        {product.category.name}
                      </p>
                    )}
                    <Link to={`/product/${product.slug}`}
                      className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 text-sm block">
                      {product.name}
                    </Link>
                    {product.brand && (
                      <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Stock */}
                    <p className={clsx('text-xs mt-1 mb-3',
                      product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500')}>
                      {product.stock_quantity > 0
                        ? product.stock_quantity <= 5
                          ? `Only ${product.stock_quantity} left`
                          : 'In Stock'
                        : 'Out of Stock'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock_quantity === 0}
                        className={clsx(
                          'flex-1 btn-primary py-2 text-sm gap-1.5 justify-center',
                          product.stock_quantity === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <FiShoppingCart size={14} /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggle(product, isAuthenticated)}
                        className="p-2 rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Promo strip */}
        {items.length > 0 && (
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiHeart size={24} className="text-pink-300 shrink-0" />
              <div>
                <p className="font-bold">Don't miss out!</p>
                <p className="text-sm text-primary-200">Items in your wishlist may go out of stock.</p>
              </div>
            </div>
            <button
              onClick={() => items.forEach((i) => i.product && addItem(i.product, 1, isAuthenticated))}
              className="btn-accent shrink-0 gap-2"
            >
              <FiShoppingCart size={16} /> Add All to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
