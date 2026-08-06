import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX,
         FiPackage, FiShoppingCart, FiShield, FiLogOut } from 'react-icons/fi';
import { updateMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function Avatar({ user, size = 'lg' }) {
  const sizeClasses = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-12 h-12 text-lg';
  return (
    <div className={clsx(
      'rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0',
      sizeClasses
    )}>
      {user?.avatar_url
        ? <img src={user.avatar_url} alt={user.name} className={clsx('rounded-full object-cover', sizeClasses)} />
        : user?.name?.charAt(0).toUpperCase()
      }
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="icon-chip mt-0.5">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value || <span className="text-gray-300 italic">Not set</span>}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar_url: user?.avatar_url || '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateMe(form);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '',
               address: user?.address || '', avatar_url: user?.avatar_url || '' });
    setEditing(false);
  };

  const quickLinks = [
    { icon: FiPackage,      label: 'My Orders', to: '/orders',  chipClass: 'icon-chip' },
    { icon: FiShoppingCart, label: 'Cart',       to: '/cart',    chipClass: 'icon-chip' },
    { icon: FiShield,       label: 'Security',   to: '#',        chipClass: 'icon-chip-success' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="container-page py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Avatar + Quick Links ── */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="card p-6 flex flex-col items-center text-center">
              <Avatar user={user} size="lg" />
              <h2 className="font-bold text-gray-900 text-lg mt-4">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className={clsx('badge mt-2',
                user?.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600')}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 Customer'}
              </span>
              <p className="text-xs text-gray-400 mt-3">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>

            {/* Quick links */}
            <div className="card p-4 space-y-1">
              {quickLinks.map(({ icon: Icon, label, to, chipClass }) => (
                <Link key={label} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={chipClass}>
                    <Icon size={15} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                </Link>
              ))}
              <button onClick={logout}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group w-full text-left">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <FiLogOut size={15} className="text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500 group-hover:text-red-600">Log Out</span>
              </button>
            </div>
          </div>

          {/* ── Right: Info / Edit ── */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Personal Information</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary gap-1.5 text-sm py-2 px-4">
                    <FiEdit3 size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="btn-secondary gap-1.5 text-sm py-2 px-4">
                      <FiX size={14} /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary gap-1.5 text-sm py-2 px-4">
                      <FiSave size={14} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div>
                  <InfoRow icon={FiUser}   label="Full Name"       value={user?.name} />
                  <InfoRow icon={FiMail}   label="Email Address"   value={user?.email} />
                  <InfoRow icon={FiPhone}  label="Phone Number"    value={user?.phone} />
                  <InfoRow icon={FiMapPin} label="Default Address" value={user?.address} />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { name: 'name',       label: 'Full Name',          icon: FiUser,   type: 'text',  placeholder: 'John Doe' },
                    { name: 'phone',      label: 'Phone Number',       icon: FiPhone,  type: 'tel',   placeholder: '+1 (555) 000-0000' },
                    { name: 'avatar_url', label: 'Avatar URL',         icon: FiUser,   type: 'url',   placeholder: 'https://…' },
                  ].map(({ name, label, icon: Icon, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name={name} type={type} value={form[name]} onChange={handleChange}
                          placeholder={placeholder} className="input pl-10" />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Default Address</label>
                    <div className="relative">
                      <FiMapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <textarea name="address" value={form.address} onChange={handleChange}
                        placeholder="123 Main St, New York, NY 10001" rows={3}
                        className="input pl-10 resize-none text-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">* Email address cannot be changed from this screen.</p>
                </div>
              )}
            </div>

            {/* Account stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: 'Account Status', value: user?.is_active ? 'Active' : 'Inactive',
                  color: user?.is_active ? 'text-green-600' : 'text-red-500' },
                { label: 'Role', value: user?.role === 'admin' ? 'Administrator' : 'Customer',
                  color: 'text-primary-500' },
                { label: 'Email Verified', value: '✓ Verified', color: 'text-green-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={clsx('text-sm font-bold', color)}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
