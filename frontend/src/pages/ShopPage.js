import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiChevronDown, FiChevronUp, FiSliders } from 'react-icons/fi';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/common/ProductCard';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'name',       label: 'Name A–Z' },
];

const PRICE_RANGES = [
  { label: 'All Prices',    min: '', max: '' },
  { label: 'Under $25',     min: '', max: 25 },
  { label: '$25 – $50',     min: 25, max: 50 },
  { label: '$50 – $100',    min: 50, max: 100 },
  { label: '$100 – $250',   min: 100, max: 250 },
  { label: '$250 – $500',   min: 250, max: 500 },
  { label: 'Over $500',     min: 500, max: '' },
];

// ── Collapsible filter section ────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3 hover:text-primary-600 transition-colors">
        {title}
        {open ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ categories, filters, onFilterChange, onReset, activeCount }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <FiSliders size={16} /> Filters
          {activeCount > 0 && (
            <span className="badge bg-primary-100 text-primary-700">{activeCount}</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <FiX size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        {[{ slug: '', name: 'All Categories' }, ...categories].map((cat) => (
          <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name="category" value={cat.slug}
              checked={filters.category === cat.slug}
              onChange={() => onFilterChange('category', cat.slug)}
              className="w-4 h-4 accent-primary-600" />
            <span className={clsx('text-sm transition-colors',
              filters.category === cat.slug ? 'text-primary-600 font-medium' : 'text-gray-600 group-hover:text-gray-900')}>
              {cat.name}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        {PRICE_RANGES.map((r) => {
          const key = `${r.min}-${r.max}`;
          const active = String(filters.min_price || '') === String(r.min) &&
                         String(filters.max_price || '') === String(r.max);
          return (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="price" value={key} checked={active}
                onChange={() => onFilterChange('priceRange', r)}
                className="w-4 h-4 accent-primary-600" />
              <span className={clsx('text-sm transition-colors',
                active ? 'text-primary-600 font-medium' : 'text-gray-600 group-hover:text-gray-900')}>
                {r.label}
              </span>
            </label>
          );
        })}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox"
            checked={filters.featured === 'true'}
            onChange={(e) => onFilterChange('featured', e.target.checked ? 'true' : '')}
            className="w-4 h-4 accent-primary-600 rounded" />
          <span className="text-sm text-gray-600">Featured Only</span>
        </label>
      </FilterSection>
    </div>
  );
}

// ── Main ShopPage ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Derive current filter state from URL
  const filters = {
    q:          searchParams.get('q') || '',
    category:   searchParams.get('category') || '',
    min_price:  searchParams.get('min_price') || '',
    max_price:  searchParams.get('max_price') || '',
    sort:       searchParams.get('sort') || 'newest',
    featured:   searchParams.get('featured') || '',
    page:       parseInt(searchParams.get('page') || '1', 10),
  };

  const activeFilterCount = [filters.category, filters.min_price, filters.featured].filter(Boolean).length;

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) next.delete(k);
        else next.set(k, String(v));
      });
      // Reset page when filters change (not when explicitly setting page)
      if (!('page' in updates)) next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const handleFilterChange = (key, value) => {
    if (key === 'priceRange') {
      updateParams({ min_price: value.min, max_price: value.max });
    } else {
      updateParams({ [key]: value });
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  // Fetch products whenever URL params change
  useEffect(() => {
    setLoading(true);
    const params = {
      page: filters.page,
      per_page: 12,
      ...(filters.q && { q: filters.q }),
      ...(filters.category && { category: filters.category }),
      ...(filters.min_price && { min_price: filters.min_price }),
      ...(filters.max_price && { max_price: filters.max_price }),
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.featured && { featured: true }),
    };
    getProducts(params)
      .then((res) => {
        setProducts(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]); // eslint-disable-line

  // Fetch categories once
  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(console.error);
  }, []);

  // Sync search input when URL q param changes externally (e.g. from navbar)
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="section-title">
                {filters.category
                  ? categories.find((c) => c.slug === filters.category)?.name || 'Products'
                  : filters.q ? `Results for "${filters.q}"` : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 flex-wrap">
              <form onSubmit={handleSearch} className="relative">
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search…" className="input w-52 pr-9 py-2 text-sm" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                  <FiSearch size={15} />
                </button>
              </form>

              <select value={filters.sort} onChange={(e) => updateParams({ sort: e.target.value })}
                className="input w-44 py-2 text-sm cursor-pointer">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden btn-secondary py-2 px-3 gap-1.5 text-sm">
                <FiFilter size={15} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar categories={categories} filters={filters}
              onFilterChange={handleFilterChange} onReset={handleReset}
              activeCount={activeFilterCount} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.category && (
                  <span className="badge bg-primary-100 text-primary-700 px-3 py-1 gap-1.5 cursor-pointer"
                    onClick={() => updateParams({ category: '' })}>
                    {categories.find((c) => c.slug === filters.category)?.name}
                    <FiX size={12} />
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="badge bg-primary-100 text-primary-700 px-3 py-1 gap-1.5 cursor-pointer"
                    onClick={() => updateParams({ min_price: '', max_price: '' })}>
                    ${filters.min_price || '0'} – ${filters.max_price || '∞'}
                    <FiX size={12} />
                  </span>
                )}
                {filters.featured && (
                  <span className="badge bg-primary-100 text-primary-700 px-3 py-1 gap-1.5 cursor-pointer"
                    onClick={() => updateParams({ featured: '' })}>
                    Featured <FiX size={12} />
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Spinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <EmptyState icon="🔍" title="No products found"
                description="Try adjusting your filters or search query."
                actionLabel="Clear Filters" actionTo="/shop" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <Pagination page={filters.page} pages={pages}
                  onPageChange={(p) => updateParams({ page: p })} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-5 overflow-y-auto animate-slide-up shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">Filters</h3>
              <button onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
            </div>
            <Sidebar categories={categories} filters={filters}
              onFilterChange={(k, v) => { handleFilterChange(k, v); setMobileSidebarOpen(false); }}
              onReset={() => { handleReset(); setMobileSidebarOpen(false); }}
              activeCount={activeFilterCount} />
          </div>
        </div>
      )}
    </div>
  );
}
