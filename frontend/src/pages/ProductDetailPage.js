import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiArrowLeft, FiTruck, FiShield, FiRefreshCw,
  FiMinus, FiPlus, FiStar, FiShare2, FiHeart
} from 'react-icons/fi';
import { getProduct, getReviews, createReview } from '../api/products';
import { getRelated } from '../api/wishlist';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/common/ProductCard';
import StarRating from '../components/common/StarRating';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ product }) {
  const images = (() => {
    try {
      const parsed = product.images ? JSON.parse(product.images) : [];
      return parsed.length ? parsed : [product.image_url].filter(Boolean);
    } catch {
      return [product.image_url].filter(Boolean);
    }
  })();

  const allImages = images.length ? images : ['https://via.placeholder.com/600x600?text=No+Image'];
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-card">
        <img src={allImages[selected]} alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300" />
      </div>
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={clsx(
                'w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                i === selected ? 'border-primary-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              )}>
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Section ───────────────────────────────────────────────────────────
function ReviewsSection({ productId, rating, reviewCount }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getReviews(productId)
      .then((r) => setReviews(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const res = await createReview(productId, form);
      setReviews((prev) => [res.data, ...prev]);
      setForm({ rating: 0, title: '', comment: '' });
      setShowForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Customer Reviews
        <span className="text-sm font-normal text-gray-400 ml-3">({reviewCount} reviews)</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        {/* Summary */}
        <div className="card p-6 flex flex-col items-center text-center gap-3">
          <p className="text-6xl font-bold text-gray-900">{rating.toFixed(1)}</p>
          <StarRating value={Math.round(rating)} readOnly size={24} />
          <p className="text-sm text-gray-500">{reviewCount} reviews</p>
          <div className="w-full space-y-2 mt-2">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-gray-500">{star}</span>
                <FiStar size={10} className="text-amber-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all"
                    style={{ width: reviewCount ? `${(count / reviewCount) * 100}%` : '0%' }} />
                </div>
                <span className="w-5 text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review list */}
        <div className="lg:col-span-2 space-y-4">
          {isAuthenticated && !showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary mb-2">
              Write a Review
            </button>
          )}
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mb-4">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Log in</Link> to write a review.
            </p>
          )}

          {/* Review form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="card p-5 mb-4 animate-fade-in">
              <h4 className="font-semibold text-gray-800 mb-4">Your Review</h4>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating *</label>
                <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} size={28} />
              </div>
              <div className="mb-3">
                <input placeholder="Review title (optional)" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input text-sm" maxLength={200} />
              </div>
              <div className="mb-4">
                <textarea placeholder="Share your experience…" value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  className="input text-sm resize-none h-24" maxLength={1000} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {loading ? <Spinner /> : reviews.length === 0 ? (
            <p className="text-gray-400 text-sm py-6">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                      {r.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.user?.name}</p>
                      <StarRating value={r.rating} readOnly size={12} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.title && <p className="font-semibold text-gray-800 text-sm mt-3">{r.title}</p>}
                {r.comment && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const isWishlistedFn = useWishlistStore((s) => s.isWishlisted);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description'); // 'description' | 'specs'

  useEffect(() => {
    setLoading(true);
    setQty(1);
    getProduct(slug)
      .then((res) => {
        setProduct(res.data);
        // Fetch related products by tags + category
        getRelated(res.data.id, 4)
            .then((r) => setRelated(r.data))
            .catch(() => {});
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty, isAuthenticated);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const inStock = product.stock_quantity > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.category.slug}`}
                className="hover:text-primary-600 transition-colors">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <FiArrowLeft size={16} /> Back
        </button>

        {/* Product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
          {/* Images */}
          <ImageGallery product={product} />

          {/* Details */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <span className="badge bg-primary-100 text-primary-700">{product.category.name}</span>
              )}
              {product.is_featured && (
                <span className="badge bg-accent-100 text-accent-600">⭐ Featured</span>
              )}
              {!inStock && (
                <span className="badge bg-red-100 text-red-600">Out of Stock</span>
              )}
            </div>

            <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {product.brand && (
              <p className="text-sm text-gray-400 mb-3">Brand: <span className="font-medium text-gray-600">{product.brand}</span></p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating value={Math.round(product.rating)} readOnly size={18} />
              <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.original_price && (
                <span className="text-lg text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
              {discount && (
                <span className="badge bg-accent-500 text-white text-sm">{discount}% OFF</span>
              )}
            </div>

            {/* Qty + Add to Cart */}
            {inStock && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiMinus size={15} />
                  </button>
                  <span className="px-5 py-3 font-semibold text-gray-800 min-w-[3rem] text-center border-x border-gray-200">
                    {qty}
                  </span>
                  <button onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiPlus size={15} />
                  </button>
                </div>
                <button onClick={handleAddToCart} className="btn-primary flex-1 py-3 text-base gap-2">
                  <FiShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            )}
            {!inStock && (
              <div className="mb-6">
                <p className="text-red-500 font-semibold mb-3">Currently out of stock</p>
                <button
                  onClick={() => wishlistToggle(product, isAuthenticated)}
                  className={clsx('btn-secondary w-full py-3 gap-2', isWishlistedFn(product?.id) && 'text-red-500 border-red-200')}>
                  <FiHeart size={16} className={isWishlistedFn(product?.id) ? 'fill-red-500' : ''} />
                  {isWishlistedFn(product?.id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </div>
            )}

            {/* Stock info */}
            {inStock && (
              <p className="text-sm text-green-600 mb-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left!` : 'In Stock'}
              </p>
            )}

            {/* Actions row */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => wishlistToggle(product, isAuthenticated)}
                className={clsx('btn-secondary gap-2 text-sm py-2',
                  isWishlistedFn(product?.id) && 'text-red-500 border-red-200 bg-red-50')}>
                <FiHeart size={15} className={isWishlistedFn(product?.id) ? 'fill-red-500' : ''} />
                {isWishlistedFn(product?.id) ? 'Wishlisted' : 'Wishlist'}
              </button>
              <button onClick={handleShare} className="btn-secondary gap-2 text-sm py-2">
                <FiShare2 size={15} /> Share
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl">
              {[
                { icon: FiTruck, text: 'Free Shipping over $50' },
                { icon: FiRefreshCw, text: '30-Day Returns' },
                { icon: FiShield, text: 'Secure Checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={18} className="text-primary-600" />
                  <span className="text-xs text-gray-500 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Details */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {['description', 'specs'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx(
                  'px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px',
                  tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                )}>
                {t === 'description' ? 'Description' : 'Details & Specs'}
              </button>
            ))}
          </div>
          {tab === 'description' && (
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              {product.description || 'No description available.'}
            </p>
          )}
          {tab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {[
                ['Brand', product.brand || '—'],
                ['Category', product.category?.name || '—'],
                ['Stock', `${product.stock_quantity} units`],
                ['Rating', `${product.rating.toFixed(1)} / 5`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="font-medium text-gray-600">{k}</span>
                  <span className="text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.review_count} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
