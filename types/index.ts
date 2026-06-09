// types/index.ts

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  is_digital: boolean;
  download_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_id?: string;
  payment_reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  raw_webhook_payload?: any;
  created_at: string;
  updated_at: string;
}

// UddoktaPay API Request/Response Types
export interface UddoktaPayInitRequest {
  full_name: string;
  email: string;
  amount: number;
  metadata: {
    order_id: string;
    payment_reference: string;
    [key: string]: any;
  };
  redirect_url: string;
  cancel_url: string;
  webhook_url: string;
}

export interface UddoktaPayInitResponse {
  status: boolean;
  message: string;
  payment_url: string;
}

export interface UddoktaPayWebhookPayload {
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  amount: string;
  charge: string;
  payment_method: string;
  transaction_id: string;
  sender_number: string;
  invoice_id: string; // matches payment_reference
  date: string;
  metadata?: {
    order_id: string;
    payment_reference: string;
    [key: string]: any;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
