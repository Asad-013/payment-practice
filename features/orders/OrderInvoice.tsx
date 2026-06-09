// features/orders/OrderInvoice.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CheckCircle, Clock, FileText, Sparkles, Download, CreditCard, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="rounded-full bg-white/5 p-4 text-muted-foreground">
          <FileText className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Order Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">We couldn't retrieve the details for this order reference.</p>
        </div>
        <Link href="/">
          <Button size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate Order progress step
  let progressStep = 1;
  if (transaction && transaction.status === 'completed') {
    progressStep = 2;
  }
  if (order.status === 'completed') {
    progressStep = 3;
  }

  const hasDigital = order.order_items?.some((item: any) => item.products?.is_digital);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-[#0a0a0c]/85 backdrop-blur-xl transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
              P
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
              PayStore
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h2 className="text-2xl font-black text-foreground">Order Invoice</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Order ID: <code className="font-mono text-primary font-bold text-xs">{order.id}</code>
            </p>
          </div>
          <Badge status={order.status} className="w-fit" />
        </div>

        {/* Verification Status Alert */}
        {(verifying || verifyError || verifySuccess) && (
          <div
            className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm font-semibold transition-all ${
              verifySuccess
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : verifying
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {verifying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : verifySuccess ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
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
              <Button size="sm" onClick={handleAutoVerify} className="h-8 text-xs font-bold shrink-0">
                Verify Now
              </Button>
            )}
          </div>
        )}

        {/* Order Status Timeline Progress */}
        <Card className="border-border/60 bg-white/[0.01]">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Delivery Progress</h3>
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3 md:flex-col md:align-middle md:flex-1 md:text-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${progressStep >= 1 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-white/5 border border-border text-muted-foreground'}`}>
                  1
                </div>
                <div>
                  <div className="font-semibold text-sm">Order Placed</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="hidden md:block h-0.5 bg-border flex-1 mx-2" />

              {/* Step 2 */}
              <div className="flex items-center gap-3 md:flex-col md:align-middle md:flex-1 md:text-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${progressStep >= 2 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-white/5 border border-border text-muted-foreground'}`}>
                  2
                </div>
                <div>
                  <div className="font-semibold text-sm">Payment Verified</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {transaction?.status === 'completed' ? 'Success' : 'Pending Gateway'}
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="hidden md:block h-0.5 bg-border flex-1 mx-2" />

              {/* Step 3 */}
              <div className="flex items-center gap-3 md:flex-col md:align-middle md:flex-1 md:text-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${progressStep >= 3 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-white/5 border border-border text-muted-foreground'}`}>
                  3
                </div>
                <div>
                  <div className="font-semibold text-sm">{hasDigital ? 'Files Delivered' : 'Item Dispatched'}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {order.status === 'completed' || (order.status === 'processing' && hasDigital) ? 'Ready' : 'In Progress'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Files Instant Download delivery Box */}
        {transaction && transaction.status === 'completed' && hasDigital && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-6 space-y-4">
              <h4 className="text-emerald-400 font-bold flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 animate-pulse" /> Instant Digital Delivery
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your payment is verified. Click below to download your purchase files instantly:
              </p>
              <div className="space-y-3">
                {order.order_items
                  .filter((item: any) => item.products?.is_digital)
                  .map((item: any) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between gap-4 p-3 rounded-xl border border-emerald-500/10 bg-white/[0.01]"
                    >
                      <div>
                        <strong className="text-sm font-semibold text-foreground block">{item.products.name}</strong>
                        <span className="text-[10px] text-muted-foreground">E-Book / PDF Format</span>
                      </div>
                      <a 
                        href={item.products.download_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold gap-1.5 shadow-md shadow-emerald-500/15"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </a>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruction Block for bKash Personal matching */}
        {transaction && transaction.status === 'pending' && (
          <Card className="border-amber-500/25 bg-amber-500/5">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-amber-400 font-bold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" /> bKash Personal Invoice Matching Required
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you made the transaction using a **bKash Personal account**, you must enter the **TrxID** inside the payment window or verify manually below:
              </p>
              <ol className="text-xs text-muted-foreground list-decimal pl-4 space-y-1">
                <li>Check your bKash app or SMS statement to retrieve the Transaction ID (TrxID).</li>
                <li>Ensure the exact amount was sent to the merchant personal number.</li>
                <li>Submit the TrxID below to instantly complete your order validation.</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Details grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <Card className="border-border/60 bg-white/[0.01] md:col-span-2">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Customer Profile</span>
                  <strong className="text-sm text-foreground block">{order.customer_name}</strong>
                  <span className="text-xs text-muted-foreground block mt-0.5">{order.customer_email}</span>
                  <span className="text-xs text-muted-foreground block">{order.customer_phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Shipping Destination</span>
                  <span className="text-xs text-muted-foreground leading-normal whitespace-pre-line">{order.shipping_address}</span>
                </div>
              </div>

              {/* Items Table list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Invoice catalog items</span>
                <div className="divide-y divide-border/40">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-3 text-xs">
                      <div>
                        <strong className="text-foreground block">{item.products?.name || 'Product'}</strong>
                        <span className="text-muted-foreground mt-0.5 block">${Number(item.price).toFixed(2)} x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-foreground">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t border-border/40 pt-4 flex justify-between items-center text-sm font-bold">
                <span>Grand Total:</span>
                <span className="text-primary text-lg">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar actions / verification match */}
          <div className="space-y-6">
            <Card className="border-border/60 bg-white/[0.01]">
              <CardContent className="p-6 space-y-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Transaction Log</span>
                {transaction ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Ref:</span>
                      <code className="font-mono font-bold">{transaction.payment_reference}</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Gateway Status:</span>
                      <Badge status={transaction.status} className="text-[9px]" />
                    </div>
                    {transaction.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gateway ID:</span>
                        <code className="font-mono text-emerald-400">{transaction.transaction_id}</code>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(transaction.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No payment transaction records linked.</p>
                )}
              </CardContent>
            </Card>

            {transaction && transaction.status === 'pending' && (
              <Card className="border-border/60 bg-white/[0.01]">
                <CardContent className="p-6 space-y-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Manual Match</span>
                  <form onSubmit={handleManualVerify} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. TXN1002345"
                      className="flex h-9 w-full rounded-lg border border-border bg-white/[0.02] px-3.5 py-2 text-xs placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                    />
                    <Button type="submit" isLoading={verifying} className="w-full text-xs h-9">
                      Match Invoice
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
