import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import {
  Laptop, Shirt, Home, Dumbbell, BookOpen,
  Sparkles, Gamepad2, ShoppingBasket
} from 'lucide-react';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/common/ProductCard';
import Spinner from '../components/common/Spinner';

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 text-white">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative z-10 py-24 lg:py-32">
        <div className="max-w-2xl animate-slide-up">
          <span className="badge bg-white/10 text-white border border-white/20 text-xs mb-6 inline-block px-3 py-1.5">
            🔥 Summer Sale — Up to 40% Off
          </span>
          <h1 className="text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
            Discover Products<br />
            <span className="text-accent-400">You'll Love</span>
          </h1>
          <p className="text-lg text-primary-100 mb-10 leading-relaxed max-w-lg">
            Shop the latest electronics, fashion, home essentials and more — curated for quality, delivered fast.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="btn-accent text-base px-8 py-3.5">
              Shop Now <FiArrowRight size={18} />
            </Link>
            <Link to="/shop?featured=true" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
              Featured Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container-page py-4 grid grid-cols-3 gap-4 text-center">
          {[['50K+', 'Happy Customers'], ['10K+', 'Products'], ['99%', 'Satisfaction']].map(([num, label]) => (
            <div key={label}>
              <p className="text-xl font-bold text-white">{num}</p>
              <p className="text-xs text-primary-200">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoriesSection({ categories }) {
  // Map category name → Lucide icon component + chip variant
  // Electronics/Gaming get purple chip (cooler tech tint), rest get brand-pink
  const catConfig = {
    'Electronics':    { Icon: Laptop,         chip: 'cat-icon-chip-purple' },
    'Apparel':        { Icon: Shirt,           chip: 'cat-icon-chip' },
    'Home & Garden':  { Icon: Home,            chip: 'cat-icon-chip' },
    'Sports':         { Icon: Dumbbell,        chip: 'cat-icon-chip' },
    'Books':          { Icon: BookOpen,        chip: 'cat-icon-chip' },
    'Beauty':         { Icon: Sparkles,        chip: 'cat-icon-chip' },
    'Gaming':         { Icon: Gamepad2,        chip: 'cat-icon-chip-purple' },
    'Food & Grocery': { Icon: ShoppingBasket,  chip: 'cat-icon-chip' },
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-page">
        <div className="text-center mb-10">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Browse our wide selection of curated categories</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => {
            const { Icon, chip } = catConfig[cat.name] || { Icon: ShoppingBasket, chip: 'cat-icon-chip' };
            return (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`}
                className="group card p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={chip}>
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <p className="font-semibold text-gray-800 group-hover:text-primary-500 transition-colors text-sm leading-tight">
                  {cat.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Featured Products ─────────────────────────────────────────────────────────
function FeaturedSection({ products, loading }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-page">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Hand-picked deals just for you</p>
          </div>
          <Link to="/shop?featured=true"
            className="hidden sm:flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors">
            View All <FiArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div className="text-center mt-8 sm:hidden">
          <Link to="/shop?featured=true" className="btn-secondary">View All Featured</Link>
        </div>
      </div>
    </section>
  );
}

// ── Promo Banner ──────────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section className="py-8 bg-white">
      <div className="container-page">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white flex flex-col justify-between min-h-40">
            <p className="text-sm font-medium text-primary-200">Limited Offer</p>
            <div>
              <h3 className="text-2xl font-bold mb-2">New Electronics Drop</h3>
              <Link to="/shop?category=electronics" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 hover:text-accent-200 transition-colors">
                Shop Now <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 p-8 text-white flex flex-col justify-between min-h-40">
            <p className="text-sm font-medium text-orange-100">Free Shipping</p>
            <div>
              <h3 className="text-2xl font-bold mb-2">Orders Over $50</h3>
              <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                Start Shopping <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust Badges ──────────────────────────────────────────────────────────────
function TrustSection() {
  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On all orders over $50' },
    { icon: FiShield, title: 'Secure Payments', desc: '256-bit SSL encryption' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer service' },
  ];

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100">
      <div className="container-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter ─────────────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="container-page text-center max-w-xl mx-auto">
        <h2 className="text-3xl font-display font-bold mb-3">Stay in the Loop</h2>
        <p className="text-primary-100 mb-8 text-sm">
          Get exclusive deals, new arrivals, and style tips — straight to your inbox.
        </p>
        {submitted ? (
          <p className="text-lg font-semibold text-accent-300">🎉 Thanks! You're on the list.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
            <button type="submit" className="btn-accent px-6 py-3 shrink-0">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: true, per_page: 8 }),
      getCategories(),
    ]).then(([prodRes, catRes]) => {
      setFeatured(prodRes.data.items);
      setCategories(catRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featured} loading={loading} />
      <PromoBanner />
      <TrustSection />
      <NewsletterSection />
    </>
  );
}
