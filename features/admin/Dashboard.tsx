// features/admin/Dashboard.tsx
'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { createProduct, updateProduct, deleteProduct } from '@/features/admin/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Plus, Edit, Trash2, Globe, Layers, DollarSign, 
  ShoppingBag, Search, FileText, CheckCircle2, XCircle
} from 'lucide-react';

interface DashboardProps {
  initialProducts: Product[];
}

export default function Dashboard({ initialProducts }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Filter & Search State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'digital' | 'physical'>('all');

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    is_active: true,
    is_digital: false,
    download_url: '',
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
        is_digital: false,
        download_url: '',
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
      is_digital: !!editProduct.is_digital,
      download_url: editProduct.download_url || '',
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

  // Stats Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const digitalProducts = products.filter(p => p.is_digital).length;
  const averagePrice = products.reduce((acc, p) => acc + Number(p.price), 0) / (totalProducts || 1);

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || 
                            (categoryFilter === 'digital' && p.is_digital) || 
                            (categoryFilter === 'physical' && !p.is_digital);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-[#0a0a0c]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
              A
            </div>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Control Panel
            </span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" /> View Storefront
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Feedback Alert */}
        {feedbackMsg.text && (
          <div
            className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Dashboard Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/[0.01]">
            <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Inventory</CardDescription>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-black">{totalProducts}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Products created in database</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.01]">
            <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Catalog</CardDescription>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-black">{activeProducts}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Visible to customer catalog</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.01]">
            <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Digital Files</CardDescription>
              <FileText className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-black">{digitalProducts}</div>
              <p className="text-[10px] text-muted-foreground mt-1">PDF or downloadable books</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.01]">
            <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Avg price</CardDescription>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-black">${averagePrice.toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Average value of products</p>
            </CardContent>
          </Card>
        </div>

        {/* Layout details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Products Table list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
              <h3 className="text-lg font-bold text-foreground">Catalog Table</h3>
              
              {/* Table search + Category filter */}
              <div className="flex gap-2 items-center">
                <div className="relative w-40 sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Search table..."
                    className="h-8 pl-8 pr-3 w-full rounded-lg border border-border bg-white/[0.02] text-xs placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e: any) => setCategoryFilter(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-border bg-white/5 text-xs text-muted-foreground focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#0f0f13]">All</option>
                  <option value="digital" className="bg-[#0f0f13]">Digital</option>
                  <option value="physical" className="bg-[#0f0f13]">Physical</option>
                </select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No records matched search parameters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <img 
                            className="h-9 w-9 rounded-lg object-cover border border-border" 
                            src={product.image_url} 
                            alt={product.name} 
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-white/5 border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <strong className="font-semibold text-foreground text-xs block">{product.name}</strong>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]">
                            {product.description || 'No description provided.'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.is_digital ? (
                          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/25 text-emerald-400 text-[10px] py-0.5">
                            📄 Digital
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/25 text-amber-400 text-[10px] py-0.5">
                            📦 Physical
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-primary">${product.price}</TableCell>
                      <TableCell className="font-semibold">
                        {product.is_digital ? (
                          <span className="text-muted-foreground text-xs font-medium">Infinite (∞)</span>
                        ) : product.stock > 0 ? (
                          <span>{product.stock} units</span>
                        ) : (
                          <span className="text-destructive font-bold text-xs">Out of Stock</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Form Side panel */}
          <Card className="bg-white/[0.01]">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                {editingId ? <Edit className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                {editingId ? 'Modify Product' : 'Add New Product'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {editingId ? 'Modify credentials of catalog item' : 'Scaffold new product configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {editingId ? (
                // Edit Form
                <form onSubmit={handleUpdate} className="space-y-4">
                  <Input
                    label="Name"
                    required
                    value={editProduct.name || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                    <textarea
                      className="flex w-full rounded-lg border border-border bg-white/[0.03] px-3.5 py-2 text-xs placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
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

                  {!editProduct.is_digital && (
                    <Input
                      label="Stock"
                      type="number"
                      min="0"
                      required
                      value={editProduct.stock || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                    />
                  )}

                  <Input
                    label="Image URL"
                    value={editProduct.image_url || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                  />

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-digital"
                        checked={editProduct.is_digital || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditProduct({
                            ...editProduct,
                            is_digital: checked,
                            stock: checked ? 999999 : 0
                          });
                        }}
                        className="rounded border-border bg-white/5 h-4 w-4 cursor-pointer text-primary focus:ring-primary"
                      />
                      <label htmlFor="edit-digital" className="text-xs font-semibold cursor-pointer text-foreground/95 select-none">
                        Is Digital Product (PDF/Ebook)
                      </label>
                    </div>

                    {editProduct.is_digital && (
                      <Input
                        label="Downloadable File URL"
                        required
                        placeholder="e.g. https://example.com/ebook.pdf"
                        value={editProduct.download_url || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, download_url: e.target.value })}
                      />
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-active"
                        checked={editProduct.is_active || false}
                        onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                        className="rounded border-border bg-white/5 h-4 w-4 cursor-pointer text-primary focus:ring-primary"
                      />
                      <label htmlFor="edit-active" className="text-xs font-semibold cursor-pointer text-foreground/95 select-none">
                        Visible on Storefront
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <Button type="submit" isLoading={actionLoading} className="flex-1 text-xs h-9">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="flex-1 text-xs h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                // Add Form
                <form onSubmit={handleCreate} className="space-y-4">
                  <Input
                    label="Product Name"
                    required
                    placeholder="e.g. iPad Pro"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                    <textarea
                      className="flex w-full rounded-lg border border-border bg-white/[0.03] px-3.5 py-2 text-xs placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
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

                  {!newProduct.is_digital && (
                    <Input
                      label="Stock"
                      type="number"
                      min="0"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                  )}

                  <Input
                    label="Image URL"
                    placeholder="https://..."
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="new-digital"
                        checked={newProduct.is_digital}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewProduct({
                            ...newProduct,
                            is_digital: checked,
                            stock: checked ? 999999 : 0
                          });
                        }}
                        className="rounded border-border bg-white/5 h-4 w-4 cursor-pointer text-primary focus:ring-primary"
                      />
                      <label htmlFor="new-digital" className="text-xs font-semibold cursor-pointer text-foreground/95 select-none">
                        Is Digital Product (PDF/Ebook)
                      </label>
                    </div>

                    {newProduct.is_digital && (
                      <Input
                        label="Downloadable File URL"
                        required
                        placeholder="e.g. https://example.com/ebook.pdf"
                        value={newProduct.download_url}
                        onChange={(e) => setNewProduct({ ...newProduct, download_url: e.target.value })}
                      />
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="new-active"
                        checked={newProduct.is_active}
                        onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                        className="rounded border-border bg-white/5 h-4 w-4 cursor-pointer text-primary focus:ring-primary"
                      />
                      <label htmlFor="new-active" className="text-xs font-semibold cursor-pointer text-foreground/95 select-none">
                        Publish Immediately
                      </label>
                    </div>
                  </div>

                  <Button type="submit" isLoading={actionLoading} className="w-full text-xs h-9 pt-2 mt-2">
                    Create Product
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
