// app/api/payment/callback/route.ts
import { NextResponse } from 'next/server';
import { UddoktaPayClient } from '@/lib/uddoktapay';
import { PaymentService } from '@/services/payment-service';
import { OrderService } from '@/services/order-service';
import { UddoktaPayWebhookPayload } from '@/types';
import { Logger } from '@/services/logger';

export async function POST(request: Request) {
  try {
    const payload: UddoktaPayWebhookPayload = await request.json();
    const { status, transaction_id, invoice_id, metadata } = payload;

    if (!invoice_id || !status) {
      Logger.warn('Invalid webhook callback payload structure received');
      return NextResponse.json({ error: 'Invalid webhook payload structure.' }, { status: 400 });
    }

    // Use our internal payment reference (INV-XXXXXX) if available in metadata
    const paymentReference = metadata?.payment_reference || invoice_id;

    // 1. Verify payment status directly with UddoktaPay API (Preventing payload spoofing)
    const isValidPayment = await UddoktaPayClient.verifyPayment(invoice_id);
    if (!isValidPayment) {
      Logger.warn(`Payment webhook validation spoof check failed for invoice ID: ${invoice_id}`);
      return NextResponse.json({ error: 'Payment verification failed with UddoktaPay.' }, { status: 400 });
    }

    // 2. Process payment state update atomically inside DB transaction
    if (status === 'COMPLETED') {
      const isProcessed = await PaymentService.executeCompletedPaymentRpc(
        paymentReference,
        transaction_id,
        payload
      );

      if (!isProcessed) {
        return NextResponse.json({ error: 'Transaction database fulfillment failed.' }, { status: 500 });
      }

      Logger.info(`Webhook Callback: Completed transaction payment reference ${paymentReference}`);
      return NextResponse.json({ success: true, message: 'Order processed successfully.' });
    } else {
      // Find linked order ID to roll back
      const tx = await OrderService.findTransactionByQuery(paymentReference);
      if (tx) {
        await PaymentService.handleFailedPayment(paymentReference, tx.order_id, payload);
      }

      Logger.info(`Webhook Callback: Marked payment reference ${paymentReference} as incomplete.`);
      return NextResponse.json({ success: false, message: 'Payment status marked as incomplete.' });
    }
  } catch (error: any) {
    Logger.error('Webhook Callback Processing Error:', error);
    return NextResponse.json({ error: 'Internal callback processor failure.' }, { status: 500 });
  }
}
