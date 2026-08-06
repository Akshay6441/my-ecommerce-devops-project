import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiChevronRight, FiShoppingBag, FiMapPin, FiCreditCard, FiLock } from 'react-icons/fi';
import { createOrder } from '../api/orders';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                done ? 'bg-green-500 text-white' :
                active ? 'bg-primary-600 text-white shadow-md' :
                'bg-gray-200 text-gray-400'
              )}>
                {done ? <FiCheck size={14} /> : idx}
              </div>
              <span className={clsx('text-sm font-medium hidden sm:block',
                active ? 'text-primary-600' : done ? 'text-green-600' : 'text-gray-400')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('flex-1 h-0.5 max-w-16 transition-all', done ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Order Summary sidebar ─────────────────────────────────────────────────────
function CheckoutSummary({ items }) {
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiShoppingBag size={16} className="text-primary-600" /> Order Summary
      </h3>
      <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={item.product?.image_url || 'https://via.placeholder.com/40'}
                alt={item.product?.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
              <p className="text-xs text-gray-400">${item.product?.price.toFixed(2)} each</p>
            </div>
            <span className="text-sm font-semibold text-gray-900 shrink-0">
              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Shipping ──────────────────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext }) {
  const { user } = useAuth();

  // Pre-fill from user profile
  React.useEffect(() => {
    if (user?.address && !data.address) {
      onChange('address', user.address);
    }
  }, [user]); // eslint-disable-line

  const fields = [
    { key: 'fullName',  label: 'Full Name',     placeholder: 'John Doe',          half: true },
    { key: 'phone',     label: 'Phone',          placeholder: '+1 (555) 000-0000', half: true },
    { key: 'address',   label: 'Street Address', placeholder: '123 Main St',       half: false },
    { key: 'city',      label: 'City',           placeholder: 'New York',          half: true },
    { key: 'state',     label: 'State',          placeholder: 'NY',                half: true },
    { key: 'zip',       label: 'ZIP Code',       placeholder: '10001',             half: true },
    { key: 'country',   label: 'Country',        placeholder: 'United States',     half: true },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['fullName', 'address', 'city', 'state', 'zip', 'country'];
    const missing = required.filter((k) => !data[k]?.trim());
    if (missing.length) { toast.error('Please fill in all required fields'); return; }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
          <FiMapPin size={16} className="text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, label, placeholder, half }) => (
          <div key={key} className={clsx(!half && 'sm:col-span-2')}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label} *</label>
            <input value={data[key] || ''} onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder} className="input" />
          </div>
        ))}
      </div>
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery Notes (optional)</label>
        <textarea value={data.notes || ''} onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Leave at door, ring bell, etc." className="input resize-none h-20 text-sm" />
      </div>
      <button type="submit" className="btn-primary w-full py-3 text-base gap-2">
        Continue to Payment <FiChevronRight size={18} />
      </button>
    </form>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ data, onChange, onNext, onBack }) {
  const [method, setMethod] = useState(data.paymentMethod || 'card');

  const methods = [
    { id: 'card',   label: 'Credit / Debit Card', icon: '💳' },
    { id: 'paypal', label: 'PayPal',               icon: '🅿️' },
    { id: 'cod',    label: 'Cash on Delivery',      icon: '💵' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange('paymentMethod', method);
    if (method === 'card') {
      if (!data.cardNumber || !data.cardExpiry || !data.cardCvc) {
        toast.error('Please fill in card details'); return;
      }
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
          <FiCreditCard size={16} className="text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
      </div>

      <div className="space-y-3 mb-6">
        {methods.map((m) => (
          <label key={m.id}
            className={clsx(
              'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              method === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            )}>
            <input type="radio" name="paymentMethod" value={m.id}
              checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-primary-600" />
            <span className="text-xl">{m.icon}</span>
            <span className="font-medium text-gray-800">{m.label}</span>
          </label>
        ))}
      </div>

      {method === 'card' && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card Number</label>
            <input value={data.cardNumber || ''} onChange={(e) => onChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456" maxLength={19} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expiry Date</label>
              <input value={data.cardExpiry || ''} onChange={(e) => onChange('cardExpiry', e.target.value)}
                placeholder="MM / YY" maxLength={7} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVC</label>
              <input value={data.cardCvc || ''} onChange={(e) => onChange('cardCvc', e.target.value)}
                placeholder="123" maxLength={4} type="password" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name on Card</label>
            <input value={data.cardName || ''} onChange={(e) => onChange('cardName', e.target.value)}
              placeholder="John Doe" className="input" />
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <FiLock size={11} /> Card details are demo only — not stored or charged.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1 py-3">← Back</button>
        <button type="submit" className="btn-primary flex-1 py-3 gap-2">
          Review Order <FiChevronRight size={18} />
        </button>
      </div>
    </form>
  );
}

// ── Step 3: Review & Place Order ──────────────────────────────────────────────
function ReviewStep({ data, items, onBack, onPlaceOrder, submitting }) {
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const address = [data.address, data.city, data.state, data.zip, data.country].filter(Boolean).join(', ');

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>

      {/* Shipping summary */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><FiMapPin size={14} /> Shipping to</p>
        </div>
        <p className="text-sm text-gray-600">{data.fullName}</p>
        <p className="text-sm text-gray-500">{address}</p>
        {data.phone && <p className="text-sm text-gray-500">{data.phone}</p>}
        {data.notes && <p className="text-xs text-gray-400 italic mt-1">Note: {data.notes}</p>}
      </div>

      {/* Payment summary */}
      <div className="card p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
          <FiCreditCard size={14} /> Payment
        </p>
        <p className="text-sm text-gray-600 capitalize">
          {data.paymentMethod === 'card' ? '💳 Credit/Debit Card' :
           data.paymentMethod === 'paypal' ? '🅿️ PayPal' : '💵 Cash on Delivery'}
        </p>
      </div>

      {/* Items */}
      <div className="card p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {items.reduce((s, i) => s + i.quantity, 0)} Items
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate max-w-xs">{item.product?.name} × {item.quantity}</span>
              <span className="font-medium text-gray-800 shrink-0 ml-3">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1 py-3" disabled={submitting}>← Back</button>
        <button onClick={onPlaceOrder} disabled={submitting} className="btn-accent flex-1 py-3 gap-2 text-base">
          {submitting ? 'Placing Order…' : `Place Order · $${total.toFixed(2)}`}
          {!submitting && <FiLock size={16} />}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
        <FiLock size={11} /> Your order is secure and encrypted
      </p>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ orderId }) {
  return (
    <div className="text-center py-10 animate-slide-up">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <FiCheck size={36} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
      <p className="text-gray-500 mb-1">Thank you for your purchase.</p>
      <p className="text-sm text-gray-400 mb-8">Order #{orderId} — confirmation sent to your email.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-primary gap-2"><FiShoppingBag size={16} /> My Orders</Link>
        <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (items.length === 0 && !orderId) navigate('/cart');
  }, [items, orderId, navigate]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const address = [
      formData.fullName,
      formData.address,
      formData.city,
      formData.state,
      formData.zip,
      formData.country,
    ].filter(Boolean).join(', ');

    try {
      const res = await createOrder({
        shipping_address: address,
        payment_method: formData.paymentMethod || 'card',
        notes: formData.notes || null,
      });
      setOrderId(res.data.id);
      clearCart(true);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderId) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-page max-w-5xl">
        <Link to="/cart" className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1.5 mb-6">
          ← Back to Cart
        </Link>
        <h1 className="section-title mb-8 text-center">Checkout</h1>

        {step < 4 && <StepIndicator current={step} />}

        <div className={clsx('grid gap-8', step < 4 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 max-w-lg mx-auto')}>
          <div className={clsx('bg-white rounded-2xl shadow-card p-6 sm:p-8', step < 4 ? 'lg:col-span-2' : '')}>
            {step === 1 && <ShippingStep data={formData} onChange={handleChange} onNext={() => setStep(2)} />}
            {step === 2 && <PaymentStep data={formData} onChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <ReviewStep data={formData} items={items} onBack={() => setStep(2)}
              onPlaceOrder={handlePlaceOrder} submitting={submitting} />}
            {step === 4 && <SuccessScreen orderId={orderId} />}
          </div>

          {step < 4 && (
            <div className="lg:col-span-1">
              <CheckoutSummary items={items} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
