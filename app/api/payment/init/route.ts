// app/api/payment/init/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { UddoktaPayClient } from '@/lib/uddoktapay';
import { CartItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/config';
import { Logger } from '@/services/logger';

import { RateLimiter } from '@/lib/rate-limiter';
import { validateCheckoutInput } from '@/validators';

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitCheck = RateLimiter.checkLimit(ip, 10, 60000); // Max 10 checkouts per min per IP
    if (!limitCheck.allowed) {
      Logger.warn(`Rate limit exceeded for checkout IP: ${ip}`);
      return NextResponse.json({ error: 'Too many requests. Please slow down and try again.' }, { status: 429 });
    }

    const body = await request.json();

    // 1. DTO Validation
    const validation = validateCheckoutInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { customerName, customerEmail, customerPhone, shippingAddress, items } = body;

    // 2. Fetch products and calculate total based on DB prices (avoids price tampering)
    const productIds = items.map((item: CartItem) => item.product.id);
    const { data: dbProducts, error: dbError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true);

    if (dbError || !dbProducts) {
      Logger.error('Failed to retrieve catalog products during initialization', dbError);
      return NextResponse.json({ error: 'Failed to retrieve catalog products.' }, { status: 500 });
    }

    let calculatedTotal = 0;
    const itemsToProcess: Array<{ product_id: string; price: number; quantity: number; currentStock: number }> = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p: any) => p.id === item.product.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found or inactive: ${item.product.name}` }, { status: 404 });
      }

      // Check stock availability
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${dbProduct.name}. Available: ${dbProduct.stock}` }, { status: 400 });
      }

      calculatedTotal += Number(dbProduct.price) * item.quantity;
      itemsToProcess.push({
        product_id: dbProduct.id,
        price: Number(dbProduct.price),
        quantity: item.quantity,
        currentStock: dbProduct.stock,
      });
    }

    // 3. Database operations - Create Order
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        total_amount: calculatedTotal,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      Logger.error('Order Insertion Error:', orderError);
      return NextResponse.json({ error: 'Failed to place order.' }, { status: 500 });
    }

    // 4. Create Order Items
    const orderItemsPayload = itemsToProcess.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      Logger.error('Order Items Insertion Error:', itemsError);
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json({ error: 'Failed to process order details.' }, { status: 500 });
    }

    // 5. Generate unique payment reference to prevent duplicates and secure callback validation
    const paymentReference = `INV-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 6. Request payment session from UddoktaPay first to obtain gateway ID
    const baseUrl = CONFIG.APP_URL;
    let redirectUrl = '';
    try {
      redirectUrl = await UddoktaPayClient.initPayment({
        full_name: customerName,
        email: customerEmail,
        amount: calculatedTotal,
        metadata: {
          order_id: newOrder.id,
          payment_reference: paymentReference,
        },
        redirect_url: `${baseUrl}/order/${newOrder.id}?ref=${paymentReference}`,
        cancel_url: `${baseUrl}/order/${newOrder.id}?status=cancelled&ref=${paymentReference}`,
        webhook_url: `${baseUrl}/api/payment/callback`,
      });
    } catch (err: any) {
      Logger.error('UddoktaPay session initialization failed during checkout API call', err);
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json({ error: err.message || 'Failed to initialize payment gateway.' }, { status: 502 });
    }

    // Extract gateway invoice ID from the payment URL
    const urlParts = redirectUrl.split('/');
    const gatewayInvoiceId = urlParts[urlParts.length - 1];

    // 7. Create pending transaction record containing the gateway invoice ID
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        order_id: newOrder.id,
        payment_method: 'bkash', // UddoktaPay acts as gateway
        payment_reference: paymentReference,
        amount: calculatedTotal,
        status: 'pending',
        raw_webhook_payload: { gateway_invoice_id: gatewayInvoiceId },
      });

    if (transactionError) {
      Logger.error('Transaction Insertion Error:', transactionError);
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json({ error: 'Failed to register checkout transaction.' }, { status: 500 });
    }

    Logger.info(`Payment checkout initialized successfully for Order ID ${newOrder.id}`);
    return NextResponse.json({ paymentUrl: redirectUrl });
  } catch (error: any) {
    Logger.error('Payment Init API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
