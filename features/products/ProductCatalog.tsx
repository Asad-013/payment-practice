// features/products/ProductCatalog.tsx
'use client';

import { useState } from 'react';
import { Product, CartItem } from '@/types';
import { useCart } from '@/hooks/use-cart';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [products] = useState<Product[]>(initialProducts);
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Track Order / Verify Payment State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Customer checkout state
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/payment/init', {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        items: cart,
      });

      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        setErrorMsg('Failed to initialize payment gateway.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await axios.post('/api/payment/verify', {
        query: searchQuery.trim(),
      });

      if (response.data?.orderId) {
        window.location.href = `/order/${response.data.orderId}`;
      } else {
        setSearchError('No order found with the provided reference.');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.response?.data?.error || 'Verification lookup failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>Premium PayStore</h1>
        <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
          🛒 Cart <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <main>
        {/* Track Order / Verify Payment Panel */}
        <Card style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Track & Verify Payment</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Enter your Order ID, Invoice ID, or UddoktaPay Transaction ID to verify and track:
          </p>
          <form onSubmit={handleOrderSearch} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <input
              type="text"
              required
              placeholder="e.g. INV-D56C1B or transaction ID"
              className="form-control"
              style={{ flexGrow: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" isLoading={searchLoading}>
              Track
            </Button>
          </form>
          {searchError && (
            <p style={{ color: 'var(--danger-accent)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{searchError}</p>
          )}
        </Card>

        <h2 className="section-title">Latest Gadgets</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              {product.image_url && (
                <img className="product-image" src={product.image_url} alt={product.name} />
              )}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-meta">
                  <span className="product-price">${product.price}</span>
                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Backdrop */}
      <div
        className={`backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            &times;
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.product.id}>
                <div className="cart-item-details">
                  <h4>{item.product.name}</h4>
                  <p>${item.product.price} each</p>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            {errorMsg && (
              <p style={{ color: 'var(--danger-accent)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {errorMsg}
              </p>
            )}

            <form className="checkout-form" onSubmit={handleCheckout}>
              <Input
                label="Full Name"
                required
                placeholder="e.g. Asaduzzaman"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="e.g. info@paymently.io"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />

              <Input
                label="Phone Number"
                required
                placeholder="e.g. 01700000000"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ marginBottom: '0.35rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shipping Address</label>
                <textarea
                  required
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="form-control"
                  rows={2}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                />
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                marginTop: '0.5rem',
                marginBottom: '1rem'
              }}>
                <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>⚠️ For bKash Personal Users:</strong>
                After sending the money, you <strong>must submit the Transaction ID (TrxID)</strong> on the payment screen to verify and complete your order instantly.
              </div>

              <Button type="submit" isLoading={loading} className="checkout-btn">
                Pay with UddoktaPay
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
