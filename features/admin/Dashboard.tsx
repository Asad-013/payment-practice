// features/admin/Dashboard.tsx
'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { createProduct, updateProduct, deleteProduct } from '@/features/admin/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface DashboardProps {
  initialProducts: Product[];
}

export default function Dashboard({ initialProducts }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    is_active: true,
  });

  // Edit Product Form State
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 5000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const result = await createProduct(newProduct);
    setActionLoading(false);

    if (result.success && result.product) {
      setProducts([result.product, ...products]);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: '',
        is_active: true,
      });
      showFeedback('Product created successfully!', 'success');
    } else {
      showFeedback(result.error || 'Failed to create product.', 'error');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setEditProduct(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setActionLoading(true);
    const result = await updateProduct(editingId, {
      name: editProduct.name,
      description: editProduct.description,
      price: Number(editProduct.price),
      stock: Number(editProduct.stock),
      image_url: editProduct.image_url,
      is_active: editProduct.is_active,
    });
    setActionLoading(false);

    if (result.success && result.product) {
      setProducts(products.map((p) => (p.id === editingId ? result.product! : p)));
      setEditingId(null);
      showFeedback('Product updated successfully!', 'success');
    } else {
      showFeedback(result.error || 'Failed to update product.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setActionLoading(true);
    const result = await deleteProduct(id);
    setActionLoading(false);

    if (result.success) {
      setProducts(products.filter((p) => p.id !== id));
      showFeedback('Product deleted successfully!', 'success');
    } else {
      showFeedback(result.error || 'Failed to delete product.', 'error');
    }
  };

  return (
    <>
      <header>
        <h1>Admin Control Center</h1>
        <Link href="/" className="cart-trigger" style={{ textDecoration: 'none' }}>
          🌐 View Storefront
        </Link>
      </header>

      <main style={{ maxWidth: '1400px' }}>
        {feedbackMsg.text && (
          <div
            style={{
              background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--success-accent)' : 'var(--danger-accent)'}`,
              color: feedbackMsg.type === 'success' ? 'var(--success-accent)' : 'var(--danger-accent)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              fontWeight: 500,
            }}
          >
            {feedbackMsg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
          {/* Product List Panel */}
          <div>
            <h2 className="section-title">Products Catalog</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {products.map((product) => (
                <Card
                  key={product.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '1.5rem',
                    gap: '2rem',
                  }}
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{product.name}</h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: product.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: product.is_active ? 'var(--success-accent)' : 'var(--danger-accent)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem 0' }}>
                      {product.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                      <span>
                        Price: <strong>${product.price}</strong>
                      </span>
                      <span>
                        Stock: <strong>{product.stock} units</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button onClick={() => handleEditClick(product)} style={{ padding: '0.5rem 1rem' }}>
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="danger"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Form Side-Panel (Add / Edit) */}
          <Card
            style={{
              padding: '2rem',
              position: 'sticky',
              top: '120px',
            }}
          >
            {editingId ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="checkout-form">
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Modify Product</h3>
                
                <Input
                  label="Name"
                  required
                  value={editProduct.name || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ marginBottom: '0.35rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editProduct.description || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  />
                </div>

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editProduct.price || 0}
                  onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                />

                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  required
                  value={editProduct.stock || 0}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                />

                <Input
                  label="Image URL"
                  value={editProduct.image_url || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                />

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editProduct.is_active || false}
                    onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="edit-active" style={{ cursor: 'pointer' }}>Visible on storefront</label>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <Button type="submit" isLoading={actionLoading} style={{ flexGrow: 1 }}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              // Add Form
              <form onSubmit={handleCreate} className="checkout-form">
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Add Product</h3>

                <Input
                  label="Product Name"
                  required
                  placeholder="e.g. iPad Pro"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ marginBottom: '0.35rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Provide details..."
                  />
                </div>

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />

                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  required
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />

                <Input
                  label="Image URL"
                  placeholder="https://..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                />

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    id="new-active"
                    checked={newProduct.is_active}
                    onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="new-active" style={{ cursor: 'pointer' }}>Publish immediately</label>
                </div>

                <Button type="submit" isLoading={actionLoading} style={{ marginTop: '1.5rem', width: '100%' }}>
                  Create Product
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
