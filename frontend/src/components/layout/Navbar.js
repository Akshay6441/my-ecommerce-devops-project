import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX,
  FiChevronDown, FiLogOut, FiPackage, FiSettings, FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import { getSearchSuggestions } from '../../api/wishlist';
import clsx from 'clsx';

const NAV_LINKS = [
  { to: '/',                         label: 'Home' },
  { to: '/shop',                     label: 'Shop' },
  { to: '/shop?category=electronics',label: 'Electronics' },
  { to: '/shop?category=gaming',     label: 'Gaming' },
  { to: '/shop?category=beauty',     label: 'Beauty' },
];

// ── Search bar with autocomplete ──────────────────────────────────────────────
function SearchBar({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    getSearchSuggestions(q)
      .then((r) => { setSuggestions(r.data); setOpen(r.data.length > 0); })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    onClose?.();
  };

  const handleSuggestionClick = (slug) => {
    setOpen(false);
    setQuery('');
    navigate(`/product/${slug}`);
    onClose?.();
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products, brands…"
          className="input pl-10 pr-4 py-2 text-sm w-full"
          autoComplete="off"
          aria-label="Search"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        )}
      </form>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden z-50 animate-fade-in">
          <p className="px-4 py-2 text-xs text-gray-400 font-medium border-b border-gray-50 flex items-center gap-1.5">
            <FiTrendingUp size={11} /> Suggestions
          </p>
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuggestionClick(s.slug)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              {s.image_url && (
                <img src={s.image_url} alt={s.name}
                  className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                {s.category && <p className="text-xs text-gray-400">{s.category}</p>}
              </div>
              <p className="text-sm font-bold text-primary-600 shrink-0">${s.price.toFixed(2)}</p>
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2.5 text-sm text-primary-600 font-semibold hover:bg-primary-50 transition-colors border-t border-gray-50 flex items-center gap-2"
          >
            <FiSearch size={13} /> See all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
    )}>
      <div className="container-page">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-2xl font-display font-bold gradient-text">ShopVibe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                )}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Search — desktop */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md">
            <SearchBar />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Wishlist */}
            <Link to="/wishlist"
              className="relative p-2 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors">
              <FiHeart size={21} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <FiShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={clsx('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-1 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/profile', icon: FiUser,    label: 'My Profile' },
                      { to: '/orders',  icon: FiPackage, label: 'My Orders' },
                      { to: '/wishlist',icon: FiHeart,   label: 'Wishlist' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Icon size={15} /> {label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors">
                        <FiSettings size={15} /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <FiLogOut size={15} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"    className="btn-secondary py-2 px-4 text-sm">Log In</Link>
                <Link to="/register" className="btn-primary  py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="container-page py-4 flex flex-col gap-3">
            {/* Mobile search */}
            <SearchBar onClose={() => setMobileOpen(false)} />

            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => clsx(
                  'py-2 px-3 rounded-xl text-sm font-medium',
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                )}>
                {l.label}
              </NavLink>
            ))}

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center">Log In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary  flex-1 justify-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
