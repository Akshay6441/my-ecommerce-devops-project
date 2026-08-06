import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { getMyOrders } from '../api/orders';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import clsx from 'clsx';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
};

const STATUS_ICONS = {
  pending: '🕐', processing: '⚙️', shipped: '🚚', delivered: '✅', cancelled: '❌',
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Header row */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((o) => !o)}>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order</p>
            <p className="font-bold text-gray-800 text-sm">#{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total</p>
            <p className="font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Status</p>
            <span className={clsx('badge text-xs', STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600')}>
              {STATUS_ICONS[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-gray-400 shrink-0">
          {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 animate-fade-in">
          <div className="space-y-4 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Link to={`/product/${item.product?.slug}`} className="shrink-0">
                  <img src={item.product?.image_url || 'https://via.placeholder.com/60'}
                    alt={item.product?.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 hover:opacity-80 transition-opacity" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product?.slug}`}
                    className="text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-1 flex items-center gap-1">
                    {item.product?.name} <FiExternalLink size={11} className="shrink-0 opacity-50" />
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm shrink-0">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="text-gray-500">
              <span className="font-medium text-gray-700">Ship to: </span>
              {order.shipping_address}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">
                Payment: <span className="font-medium text-gray-700 capitalize">{order.payment_method}</span>
              </span>
              <span className={clsx('badge text-xs',
                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader title="My Orders" subtitle="Track and review all your purchases" />
      <div className="container-page py-8 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" title="No orders yet"
            description="You haven't placed any orders. Start shopping!"
            actionLabel="Browse Products" actionTo="/shop" />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}
