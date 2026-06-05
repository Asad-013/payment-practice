// app/api/payment/verify/route.ts
import { NextResponse } from 'next/server';
import { OrderService } from '@/services/order-service';
import { PaymentService } from '@/services/payment-service';
import { Logger } from '@/services/logger';

import { RateLimiter } from '@/lib/rate-limiter';
import { validatePaymentQuery } from '@/validators';

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitCheck = RateLimiter.checkLimit(ip, 30, 60000); // Max 30 checks per min per IP
    if (!limitCheck.allowed) {
      Logger.warn(`Rate limit exceeded for verify IP: ${ip}`);
      return NextResponse.json({ error: 'Too many requests. Please slow down and try again.' }, { status: 429 });
    }

    const { query, orderId } = await request.json();

    if (!query && !orderId) {
      return NextResponse.json({ error: 'Please provide an Order ID, Invoice ID, or Transaction ID.' }, { status: 400 });
    }

    if (query) {
      const validation = validatePaymentQuery(query);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    let transaction: any = null;

    if (orderId) {
      transaction = await OrderService.getTransactionByOrderId(orderId);
    } else if (query) {
      transaction = await OrderService.findTransactionByQuery(query);
    }

    if (!transaction) {
      return NextResponse.json({ error: 'No order or transaction found matching the provided reference.' }, { status: 404 });
    }

    // If already completed, just return success
    if (transaction.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        orderId: transaction.order_id,
        amount: transaction.amount,
        paymentReference: transaction.payment_reference,
        transactionId: transaction.transaction_id,
      });
    }

    // If pending, verify and sync status with UddoktaPay
    const syncResult = await PaymentService.verifyAndSyncPendingTransaction(transaction);

    if (syncResult.success) {
      return NextResponse.json({
        success: true,
        status: syncResult.status,
        orderId: transaction.order_id,
        amount: transaction.amount,
        paymentReference: transaction.payment_reference,
        transactionId: syncResult.txId || transaction.payment_reference,
        message: syncResult.message,
      });
    }

    return NextResponse.json({
      success: false,
      status: syncResult.status,
      orderId: transaction.order_id,
      paymentReference: transaction.payment_reference,
      message: syncResult.message,
    });
  } catch (error: any) {
    Logger.error('Verify Route Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred during verification.' }, { status: 500 });
  }
}
