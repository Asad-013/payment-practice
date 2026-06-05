// services/product-service.ts
import { supabaseAdmin } from '@/lib/supabase';
import { Product } from '@/types';
import { Logger } from './logger';

export class ProductService {
  /**
   * Get all active products for the storefront
   */
  static async getActiveProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      Logger.error('Failed to get active products from database', error);
      return [];
    }
  }

  /**
   * Get all products for the admin panel
   */
  static async getAllProductsAdmin(): Promise<Product[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      Logger.error('Failed to get all admin products', error);
      throw new Error('Database product fetch error');
    }
  }

  /**
   * Add a new product to the catalog
   */
  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      Logger.info(`Product created successfully: ${data.id}`);
      return data;
    } catch (error) {
      Logger.error('Failed to insert product into database', error);
      throw new Error('Database product creation failed');
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      Logger.info(`Product updated successfully: ${id}`);
      return data;
    } catch (error) {
      Logger.error(`Failed to update product ${id}`, error);
      throw new Error('Database product update failed');
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      Logger.info(`Product deleted successfully: ${id}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to delete product ${id}`, error);
      throw new Error('Database product deletion failed');
    }
  }
}
