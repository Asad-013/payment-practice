// lib/uddoktapay.ts
import axios from 'axios';
import { UddoktaPayInitRequest, UddoktaPayInitResponse } from '../types';
import { CONFIG } from '@/config';

export class UddoktaPayClient {
  private static client = axios.create({
    baseURL: CONFIG.UDDOKTAPAY.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'RT-UDDOKTAPAY-API-KEY': CONFIG.UDDOKTAPAY.API_KEY,
    },
  });

  /**
   * Initialize a new UddoktaPay payment session
   */
  static async initPayment(data: UddoktaPayInitRequest): Promise<string> {
    try {
      const response = await this.client.post<UddoktaPayInitResponse>('/checkout-v2', {
        full_name: data.full_name,
        email: data.email,
        amount: data.amount,
        metadata: data.metadata,
        redirect_url: data.redirect_url,
        cancel_url: data.cancel_url,
        webhook_url: data.webhook_url,
      });

      if (!response.data || !response.data.status) {
        throw new Error(response.data?.message || 'Failed to initialize payment session with UddoktaPay');
      }

      return response.data.payment_url;
    } catch (error: any) {
      console.error('UddoktaPay Initialization Error:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'UddoktaPay connection failed');
    }
  }

  /**
   * Verify an existing transaction via the invoice / transaction ID lookup api
   */
  static async verifyPayment(invoiceId: string): Promise<boolean> {
    try {
      // UddoktaPay transaction verification API
      const response = await this.client.post('/verify-payment', {
        invoice_id: invoiceId,
      });

      if (response.data && response.data.status === 'COMPLETED') {
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('UddoktaPay Verification Error:', error?.response?.data || error.message);
      return false;
    }
  }

  /**
   * Fetch full details of an invoice to process manually or automatically
   */
  static async verifyPaymentDetails(invoiceId: string): Promise<any> {
    try {
      const response = await this.client.post('/verify-payment', {
        invoice_id: invoiceId,
      });
      return response.data;
    } catch (error: any) {
      console.error('UddoktaPay Details Fetch Error:', error?.response?.data || error.message);
      return null;
    }
  }
}
