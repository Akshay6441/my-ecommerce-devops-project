import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';

const links = {
  Shop: [
    { label: 'Electronics', to: '/shop?category=electronics' },
    { label: 'Apparel',     to: '/shop?category=apparel' },
    { label: 'Beauty',      to: '/shop?category=beauty' },
    { label: 'Gaming',      to: '/shop?category=gaming' },
    { label: 'Sports',      to: '/shop?category=sports' },
    { label: 'Books',       to: '/shop?category=books' },
    { label: 'Food',        to: '/shop?category=food-grocery' },
  ],
  Account: [
    { label: 'My Profile',  to: '/profile' },
    { label: 'My Orders',   to: '/orders' },
    { label: 'Wishlist',    to: '/wishlist' },
    { label: 'Cart',        to: '/cart' },
    { label: 'Login',       to: '/login' },
  ],
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Contact', to: '/' },
    { label: 'Privacy Policy', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="text-2xl font-display font-bold gradient-text">ShopVibe</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Discover the best products at unbeatable prices. Quality, speed, and trust — all in one place.
            </p>
            <div className="flex gap-3 mt-5">
              {[FiInstagram, FiTwitter, FiFacebook, FiMail].map((Icon, i) => (
                <a key={i} href="/"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShopVibe. All rights reserved.</p>
          <div className="flex gap-4">
            <span>🔒 Secure Payments</span>
            <span>🚚 Free Shipping over $50</span>
            <span>↩️ Easy Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
