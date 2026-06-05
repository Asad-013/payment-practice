import { ProductService } from '@/services/product-service';
import ProductCatalog from '@/features/products/ProductCatalog';
import { Metadata } from 'next';

export const revalidate = 0; // Always fetch fresh product data and stocks

export const metadata: Metadata = {
  title: 'Premium PayStore - Latest Gadgets & Gear',
  description: 'Discover and purchase high-quality accessories and devices safely with UddoktaPay.',
};

export default async function HomePage() {
  const products = await ProductService.getActiveProducts();

  return <ProductCatalog initialProducts={products} />;
}
