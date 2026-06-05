// app/admin/dashboard/page.tsx
import { ProductService } from '@/services/product-service';
import Dashboard from '@/features/admin/Dashboard';
import { verifyAdminAuth } from '@/features/admin/actions';
import { redirect } from 'next/navigation';
import { Logger } from '@/services/logger';

export const revalidate = 0; // Ensure fresh catalogs for dashboard updates

export default async function AdminDashboardPage() {
  try {
    // Server-side auth check: Redirect immediately to login page if user session is invalid/unauthorized
    await verifyAdminAuth();
  } catch (error: any) {
    Logger.warn('Unauthorized attempt to access Admin Dashboard, redirecting to login page', { error: error.message });
    redirect('/admin');
  }

  // Load catalog products securely
  const products = await ProductService.getAllProductsAdmin();

  return <Dashboard initialProducts={products} />;
}
