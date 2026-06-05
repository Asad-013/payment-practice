// app/admin/page.tsx
import { Metadata } from 'next';
import AdminLogin from '@/features/admin/AdminLogin';

export const metadata: Metadata = {
  title: 'Admin Access - Premium PayStore',
  description: 'Authentication control panel portal for store administrators.',
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
