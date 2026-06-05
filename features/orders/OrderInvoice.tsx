// features/orders/OrderInvoice.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface OrderInvoiceProps {
  initialOrder: any;
  initialTransaction: any;
}

export default function OrderInvoice({ initialOrder, initialTransaction }: OrderInvoiceProps) {
  const [order, setOrder] = useState(initialOrder);
  const [transaction, setTransaction] = useState(initialTransaction);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [manualQuery, setManualQuery] = useState('');

  // Auto-verify on page load if status is pending
  useEffect(() => {
    if (transaction && transaction.status === 'pending') {
      handleAutoVerify();
    }
  }, []);

  const handleAutoVerify = async () => {
    setVerifying(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const response = await axios.post('/api/payment/verify', {
        orderId: order.id,
      });

      if (response.data?.success) {
        setVerifySuccess(response.data.message || 'Payment verified successfully!');
        if (response.data.status === 'completed') {
          setTransaction((prev: any) => ({ ...prev, status: 'completed', transaction_id: response.data.transactionId }));
          setOrder((prev: any) => ({ ...prev, status: 'processing' }));
        }
      } else {
        setVerifyError(response.data?.message || 'Payment is still pending.');
      }
    } catch (err: any) {
      console.error(err);
      setVerifyError(err.response?.data?.error || 'Verification attempt failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setVerifying(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const response = await axios.post('/api/payment/verify', {
        query: manualQuery.trim(),
      });

      if (response.data?.success) {
        setVerifySuccess(response.data.message || 'Payment verified successfully!');
        if (response.data.orderId === order.id) {
          setTransaction((prev: any) => ({
            ...prev,
            status: 'completed',
            transaction_id: response.data.transactionId,
          }));
          setOrder((prev: any) => ({ ...prev, status: 'processing' }));
        } else {
          window.location.href = `/order/${response.data.orderId}`;
        }
      } else {
        setVerifyError(response.data?.message || 'Verification failed. Reference may be pending or incorrect.');
      }
    } catch (err: any) {
      console.error(err);
      setVerifyError(err.response?.data?.error || 'Verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>We couldn't retrieve the details for this order reference.</p>
        <Link href="/" className="btn" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <header>
        <h1 style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>Premium PayStore</h1>
        <Link href="/" className="cart-trigger" style={{ textDecoration: 'none' }}>
          🏠 Shop Storefront
        </Link>
      </header>

      <main style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Order Invoice</h2>
          <Badge status={order.status} />
        </div>

        {/* Verification Status Alert */}
        {(verifying || verifyError || verifySuccess) && (
          <div
            style={{
              background: verifySuccess
                ? 'rgba(16, 185, 129, 0.12)'
                : verifying
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                verifySuccess
                  ? 'var(--success-accent)'
                  : verifying
                  ? 'var(--primary-accent)'
                  : 'var(--danger-accent)'
              }`,
              color: verifySuccess
                ? 'var(--success-accent)'
                : verifying
                ? 'var(--primary-accent)'
                : 'var(--danger-accent)',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {verifying && (
                <span className="spinner" style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
              <span>
                {verifying
                  ? 'Connecting to UddoktaPay to verify payment...'
                  : verifySuccess
                  ? verifySuccess
                  : verifyError}
              </span>
            </div>
            {transaction && transaction.status === 'pending' && !verifying && (
              <Button onClick={handleAutoVerify} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Retry Verification
              </Button>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Instruction Warning Block for Pending bKash Personal Transactions */}
          {transaction && transaction.status === 'pending' && (
            <Card style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <h4 style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Payment Pending Matching (bKash Personal)
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Because you paid using a <strong>bKash Personal Number</strong>, you must match your payment to complete the checkout automatically:
              </p>
              <ol style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '1.25rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Check your bKash SMS or app statement to find your <strong>Transaction ID (TrxID)</strong>.</li>
                <li>Submit that TrxID on the UddoktaPay payment gateway window to confirm.</li>
                <li>If you already verified it on UddoktaPay, click <strong>"Retry Verification"</strong> at the top.</li>
                <li>If you closed the checkout window, the merchant will review your payment and approve your order manually in a few minutes.</li>
              </ol>
            </Card>
          )}

          {/* Main Card */}
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Order Details</h4>
                <p style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>ID: <strong style={{ fontFamily: 'monospace' }}>{order.id}</strong></p>
                <p style={{ fontSize: '0.95rem' }}>Placed on: <strong>{new Date(order.created_at).toLocaleString()}</strong></p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Payment Status</h4>
                {transaction ? (
                  <>
                    <p style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Ref/Invoice: <strong style={{ fontFamily: 'monospace' }}>{transaction.payment_reference}</strong></p>
                    <p style={{ fontSize: '0.95rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      Status: <Badge status={transaction.status} />
                    </p>
                    {transaction.transaction_id && (
                      <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>Gateway TxID: <strong style={{ fontFamily: 'monospace', color: 'var(--success-accent)' }}>{transaction.transaction_id}</strong></p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>No transaction details linked.</p>
                )}
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Customer Profile</h4>
                <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{order.customer_name}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{order.customer_email}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{order.customer_phone}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Shipping Destination</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{order.shipping_address}</p>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Order Catalog Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.order_items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h5 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.products?.name || 'Product'}</h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        ${Number(item.price).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Grand Total:</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </Card>

          {/* Verification / Lookup Panel */}
          <Card>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Verify Another Transaction</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Did you pay but the status didn't update automatically? Enter your UddoktaPay **Transaction ID** or **Invoice ID** below to verify manually:
            </p>
            <form onSubmit={handleManualVerify} className="checkout-form" style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN1002345 or INV-D56C1B"
                    className="form-control"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" isLoading={verifying}>
                  Verify
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
