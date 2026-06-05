// services/order-service.ts
import { supabaseAdmin } from '@/lib/supabase';
import { Logger } from './logger';

export class OrderService {
  /**
   * Find an order and its items by ID
   */
  static async getOrderById(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      Logger.error(`Failed to get order ${orderId} details`, error);
      return null;
    }
  }

  /**
   * Get transaction detail by Order ID
   */
  static async getTransactionByOrderId(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      Logger.error(`Failed to get transaction details for order ${orderId}`, error);
      return null;
    }
  }

  /**
   * Find transaction record using unique identifiers (payment reference, transaction ID, gateway invoice ID)
   */
  static async findTransactionByQuery(query: string): Promise<any> {
    const cleanQuery = query.trim();
    try {
      // 1. Check by reference or transaction_id
      let { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*, orders(*)')
        .or(`payment_reference.eq."${cleanQuery}",transaction_id.eq."${cleanQuery}"`)
        .maybeSingle();

      if (error) {
        Logger.error(`Error querying transaction using direct references: ${cleanQuery}`, error);
      }

      // 2. Check JSONB gateway_invoice_id if not resolved
      if (!data) {
        const { data: jsonbData, error: jsonbError } = await supabaseAdmin
          .from('transactions')
          .select('*, orders(*)')
          .eq('raw_webhook_payload->>gateway_invoice_id', cleanQuery)
          .maybeSingle();

        if (jsonbError) {
          Logger.error(`Error querying transaction using JSONB gateway reference: ${cleanQuery}`, jsonbError);
        }
        data = jsonbData;
      }

      return data;
    } catch (error) {
      Logger.error(`Failed to find transaction by query query: ${cleanQuery}`, error);
      return null;
    }
  }
}
