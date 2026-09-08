import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { B2COrder, B2CAddress } from '../../types';

interface CustomerDashboardPageProps {
  orders: B2COrder[];
  setActiveTab: (tab: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  orders,
  setActiveTab,
}) => {
  const { b2cUser, logout } = useAuth();
  const { wishlist } = useWishlist();

  const [section, setSection] = useState<'profile' | 'addresses' | 'payments' | 'settings'>('profile');
  const [addresses, setAddresses] = useState<B2CAddress[]>(b2cUser?.addresses || []);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Karnataka');
  const [newPincode, setNewPincode] = useState('');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: B2CAddress = {
      id: `addr_${Date.now()}`,
      fullName: b2cUser?.name || 'Customer',
      phone: b2cUser?.phone || '+91 98765 00000',
      street: newStreet,
      city: newCity,
      state: newState,
      pincode: newPincode,
      addressType: 'home',
    };
    setAddresses([...addresses, created]);
    setShowAddAddress(false);
    setNewStreet('');
    setNewCity('');
    setNewPincode('');
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Customer Account</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your personal details, shipping addresses, orders and preferences
        </p>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: '260px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar Nav */}
        <aside className="card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
          <div className="flex items-center gap-3" style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {b2cUser?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b2cUser?.name || 'Utkarsh Sharma'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b2cUser?.email || 'customer@kognitiminds.com'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button
              onClick={() => setSection('profile')}
              className={`btn btn-sm ${section === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <User size={15} /> My Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <Package size={15} /> My Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <Heart size={15} /> Wishlist ({wishlist.length})
            </button>
            <button
              onClick={() => setSection('addresses')}
              className={`btn btn-sm ${section === 'addresses' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <MapPin size={15} /> Saved Addresses
            </button>
            <button
              onClick={() => setSection('payments')}
              className={`btn btn-sm ${section === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <CreditCard size={15} /> Payment Methods
            </button>
            <button
              onClick={() => setSection('settings')}
              className={`btn btn-sm ${section === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <Settings size={15} /> Account Settings
            </button>
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start', color: 'var(--rose-600)', padding: '0.6rem 0.85rem' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Content Section */}
        <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: '#FFFFFF' }}>
          {section === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Personal Profile</h3>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    {b2cUser?.name || 'Utkarsh Sharma'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    {b2cUser?.email || 'customer@kognitiminds.com'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    {b2cUser?.phone || '+91 98765 43210'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Customer Tier</label>
                  <span className="badge badge-blue">Verified Consumer</span>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={18} className="text-emerald-600" /> Account Security & Privacy
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  Your personal profile is protected under strict Indian data privacy standards. Passwords are salted and hashed.
                </p>
              </div>
            </div>
          )}

          {section === 'addresses' && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Saved Shipping Addresses</h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={15} /> Add New Address
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} style={{ padding: '1.25rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input type="text" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} required className="form-input" />
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input type="text" value={newPincode} maxLength={6} onChange={(e) => setNewPincode(e.target.value)} required className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                </form>
              )}

              <div className="flex flex-col gap-3">
                {addresses.map((addr, i) => (
                  <div key={addr.id || i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong style={{ fontSize: '0.9rem' }}>{addr.fullName}</strong>
                        {addr.isDefault && <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>Default</span>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Phone: {addr.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'payments' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Saved Payment Methods</h3>
              <div className="flex flex-col gap-3">
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '6px', color: 'var(--primary)' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>HDFC Bank RuPay Platinum</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Ending in 8901 • Expires 08/28</div>
                    </div>
                  </div>
                  <span className="badge badge-blue">Primary</span>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ background: 'var(--emerald-50)', padding: '0.5rem', borderRadius: '6px', color: 'var(--emerald-600)' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>UPI ID: utkarsh@oksbi</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Linked to State Bank of India</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Account Settings</h3>
              <div className="flex flex-col gap-4" style={{ maxWidth: '400px' }}>
                <div className="form-group">
                  <label className="form-label">Notification Preferences</label>
                  <label className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <input type="checkbox" defaultChecked /> WhatsApp shipment tracking notifications
                  </label>
                  <label className="flex items-center gap-2" style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    <input type="checkbox" defaultChecked /> Email tax invoices & statements
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Change Password</label>
                  <input type="password" placeholder="Current password" className="form-input" style={{ marginBottom: '0.5rem' }} />
                  <input type="password" placeholder="New password" className="form-input" />
                  <button type="button" onClick={() => alert('Password updated successfully')} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
