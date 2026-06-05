// features/admin/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { ProductService } from '@/services/product-service';
import { CONFIG } from '@/config';
import { Logger } from '@/services/logger';

/**
 * Verify if the requester is an authorized admin
 */
export async function verifyAdminAuth() {
  let jwt = '';

  const cookieStore = cookies();
  const supabaseUrl = CONFIG.SUPABASE.URL;
  const projectId = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];

  if (projectId) {
    const authCookie = cookieStore.get(`sb-${projectId}-auth-token`);
    if (authCookie) {
      try {
        const parsed = JSON.parse(authCookie.value);
        jwt = parsed?.access_token || parsed;
      } catch {
        jwt = authCookie.value;
      }
    }
  }

  if (!jwt) {
    throw new Error('Unauthorized access. Admin session not found.');
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !user) {
    throw new Error('Unauthorized access. Invalid session.');
  }

  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (dbError || userData?.role !== 'admin') {
    throw new Error('Access denied. Administrator privileges required.');
  }

  return user;
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
}) {
  try {
    await verifyAdminAuth();

    if (!data.name || data.price < 0 || data.stock < 0) {
      return { success: false, error: 'Invalid product details. Price and stock must be positive.' };
    }

    const newProduct = await ProductService.createProduct({
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      image_url: data.image_url,
      is_active: data.is_active,
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true, product: newProduct };
  } catch (error: any) {
    Logger.error('Admin action createProduct Error:', error);
    return { success: false, error: error.message || 'Failed to create product.' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    is_active: boolean;
  }>
) {
  try {
    await verifyAdminAuth();

    if (data.price !== undefined && data.price < 0) {
      return { success: false, error: 'Price cannot be negative.' };
    }
    if (data.stock !== undefined && data.stock < 0) {
      return { success: false, error: 'Stock cannot be negative.' };
    }

    const updatedProduct = await ProductService.updateProduct(id, data);

    revalidatePath('/');
    revalidatePath(`/products/${id}`);
    revalidatePath('/admin/dashboard');
    return { success: true, product: updatedProduct };
  } catch (error: any) {
    Logger.error(`Admin action updateProduct Error for ${id}:`, error);
    return { success: false, error: error.message || 'Failed to update product.' };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  try {
    await verifyAdminAuth();

    await ProductService.deleteProduct(id);

    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    Logger.error(`Admin action deleteProduct Error for ${id}:`, error);
    return { success: false, error: error.message || 'Failed to delete product.' };
  }
}
