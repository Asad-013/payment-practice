// services/payment-service.ts
import { supabaseAdmin } from '@/lib/supabase';
import { UddoktaPayClient } from '@/lib/uddoktapay';
import { Logger } from './logger';

export class PaymentService {
  /**
   * Run the process_completed_payment Postgres RPC function to atomically process order payments
   */
  static async executeCompletedPaymentRpc(paymentReference: string, transactionId: string, rawPayload: any): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.rpc('process_completed_payment', {
        p_payment_reference: paymentReference,
        p_transaction_id: transactionId,
        p_raw_payload: rawPayload,
      });

      if (error || !data || !data.success) {
        Logger.error('Database transaction RPC error:', error || data?.message);
        return false;
      }

      Logger.info(`Payment transaction resolved successfully for ref: ${paymentReference}`);
      return true;
    } catch (error) {
      Logger.error(`Exception during execution of process_completed_payment RPC for ref ${paymentReference}`, error);
      return false;
    }
  }

  /**
   * Mark transaction and order as failed when canceled/failed by gateway
   */
  static async handleFailedPayment(paymentReference: string, orderId: string, payload: any): Promise<void> {
    try {
      // Update transaction status
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', raw_webhook_payload: payload })
        .eq('payment_reference', paymentReference);

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      Logger.info(`Payment marked failed/cancelled for ref ${paymentReference}, order ${orderId}`);
    } catch (error) {
      Logger.error(`Failed to execute payment cancellation rollback for ref ${paymentReference}`, error);
    }
  }

  /**
   * Verify and sync status of an existing pending transaction with UddoktaPay
   */
  static async verifyAndSyncPendingTransaction(transaction: any): Promise<{ success: boolean; status: string; message: string; txId?: string }> {
    try {
      const gatewayInvoiceId = transaction.raw_webhook_payload?.gateway_invoice_id || transaction.payment_reference;
      
      const uddoktaData = await UddoktaPayClient.verifyPaymentDetails(gatewayInvoiceId);

      if (!uddoktaData) {
        return { success: false, status: 'pending', message: 'Could not fetch status details from UddoktaPay.' };
      }

      if (uddoktaData.status === 'COMPLETED') {
        const isProcessed = await this.executeCompletedPaymentRpc(
          transaction.payment_reference,
          uddoktaData.transaction_id || transaction.payment_reference,
          uddoktaData
        );

        if (isProcessed) {
          return {
            success: true,
            status: 'completed',
            txId: uddoktaData.transaction_id || transaction.payment_reference,
            message: 'Payment verified and order completed successfully!',
          };
        }
        return { success: false, status: 'pending', message: 'Fulfillment process failed.' };
      }

      if (uddoktaData.status === 'FAILED' || uddoktaData.status === 'CANCELLED') {
        await this.handleFailedPayment(transaction.payment_reference, transaction.order_id, uddoktaData);
        return {
          success: false,
          status: 'failed',
          message: 'Payment failed or was cancelled.',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Payment is still pending. Please complete the transaction.',
      };
    } catch (error) {
      Logger.error(`Exception during transaction verification syncing: ${transaction.id}`, error);
      return { success: false, status: 'pending', message: 'Internal verification synchronization error.' };
    }
  }
}
