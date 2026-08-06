import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiTag } from 'react-icons/fi';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import clsx from 'clsx';

// ── Cart Item Row ─────────────────────────────────────────────────────────────
function CartItem({ item }) {
  const { isAuthenticated } = useAuth();
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const product = item.product;

  if (!product) return null;

  return (
    <div className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-0 animate-fade-in">
      {/* Image */}
      <Link to={`/product/${product.slug}`}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
        <img src={product.image_url || 'https://via.placeholder.com/100'}
          alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.slug}`}
          className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 text-sm sm:text-base">
          {product.name}
        </Link>
        {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
        {product.category && (
          <span className="badge bg-gray-100 text-gray-500 mt-1">{product.category.name}</span>
        )}

        {/* Mobile price */}
        <p className="sm:hidden font-bold text-gray-900 mt-2">${(product.price * item.quantity).toFixed(2)}</p>

        {/* Qty stepper */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => updateQty(item.id, item.quantity - 1, isAuthenticated)}
              className="p-2 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Decrease quantity">
              <FiMinus size={13} />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button onClick={() => updateQty(item.id, item.quantity + 1, isAuthenticated)}
              className={clsx('p-2 text-gray-500 hover:bg-gray-50 transition-colors',
                item.quantity >= product.stock_quantity && 'opacity-40 cursor-not-allowed')}
              disabled={item.quantity >= product.stock_quantity}
              aria-label="Increase quantity">
              <FiPlus size={13} />
            </button>
          </div>
          <button onClick={() => removeItem(item.id, isAuthenticated)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove item">
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Desktop price */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <p className="font-bold text-gray-900">${(product.price * item.quantity).toFixed(2)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400">${product.price.toFixed(2)} each</p>
        )}
      </div>
    </div>
  );
}

// ── Order Summary ─────────────────────────────────────────────────────────────
function OrderSummary({ items, onCheckout }) {
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
      <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
        <FiShoppingBag size={18} className="text-primary-600" /> Order Summary
      </h2>

      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={clsx('font-medium', shipping === 0 ? 'text-green-600' : 'text-gray-800')}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (8%)</span>
          <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
            🚚 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </p>
        )}
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo code */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <FiTag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Promo code" className="input pl-8 py-2 text-sm" />
        </div>
        <button className="btn-secondary py-2 px-4 text-sm">Apply</button>
      </div>

      <button onClick={onCheckout} className="btn-primary w-full py-3 text-base gap-2 justify-center">
        Proceed to Checkout <FiArrowRight size={18} />
      </button>

      <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        🔒 Secure, encrypted checkout
      </div>
    </div>
  );
}

// ── Main Cart Page ─────────────────────────────────────────────────────────────
export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader title="Shopping Cart"
        subtitle={items.length ? `${items.reduce((s, i) => s + i.quantity, 0)} items in your cart` : undefined}>
        {items.length > 0 && (
          <button onClick={() => clearCart(isAuthenticated)}
            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5 transition-colors">
            <FiTrash2 size={14} /> Clear Cart
          </button>
        )}
      </PageHeader>

      <div className="container-page py-8">
        {items.length === 0 ? (
          <EmptyState icon="🛒" title="Your cart is empty"
            description="Looks like you haven't added anything yet. Start browsing!"
            actionLabel="Continue Shopping" actionTo="/shop" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6">
                {items.map((item) => <CartItem key={item.id} item={item} />)}
              </div>
              <div className="mt-4">
                <Link to="/shop" className="btn-secondary gap-2 text-sm">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
            {/* Summary */}
            <div>
              <OrderSummary items={items} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
