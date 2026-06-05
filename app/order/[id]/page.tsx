import { OrderService } from '@/services/order-service';
import { notFound } from 'next/navigation';
import OrderInvoice from '@/features/orders/OrderInvoice';
import { Metadata } from 'next';

interface OrderPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  return {
    title: `Order Invoice #${params.id.substring(0, 8).toUpperCase()} - Premium PayStore`,
    description: `Track status and verify payment details for order ref: ${params.id}`,
  };
}

export const revalidate = 0; // Dynamic server component

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = params;

  // 1. Fetch order details from order database service
  const order = await OrderService.getOrderById(id);
  if (!order) {
    notFound();
  }

  // 2. Fetch transaction details
  const transaction = await OrderService.getTransactionByOrderId(id);

  return <OrderInvoice initialOrder={order} initialTransaction={transaction} />;
}
