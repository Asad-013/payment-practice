// features/products/ProductCatalog.tsx
'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { CheckoutForm } from '@/features/checkout/CheckoutForm';
import { 
  Search, ShoppingBag, ShieldCheck, Sparkles, Filter, 
  BookOpen, Zap, FileText, Truck, AlertCircle, ArrowRight, Package
} from 'lucide-react';
import axios from 'axios';

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [products] = useState<Product[]>(initialProducts);
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    cartCount, 
    cartTotal, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  // Search & Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'digital' | 'physical'>('all');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Track Order / Verify Payment State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await axios.post('/api/payment/verify', {
        query: searchQuery.trim(),
      });

      if (response.data?.orderId) {
        window.location.href = `/order/${response.data.orderId}`;
      } else {
        setSearchError('No order found with the provided reference.');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.response?.data?.error || 'Verification lookup failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || 
                            (categoryFilter === 'digital' && p.is_digital) || 
                            (categoryFilter === 'physical' && !p.is_digital);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f3f4f6] font-sans pb-24 selection:bg-primary selection:text-primary-foreground">
      {/* Navbar Container */}
      <header className="sticky top-0 z-40 border-b border-border bg-[#0a0a0c]/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
              P
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              PayStore
            </span>
          </div>

          <button 
            className="group relative flex items-center gap-2 rounded-full border border-border bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/15 cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="h-4 w-4 text-primary transition-transform group-hover:rotate-12" />
            <span>Cart</span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-5 max-w-3xl mx-auto">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-white/5 border-primary/20 hover:bg-white/10 text-primary-foreground/90 font-medium select-none">
            <Zap className="h-3.5 w-3.5 text-primary animate-pulse" /> Instant Digital Delivery Enabled
          </Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground/95">
            Discover Premium <br className="hidden sm:inline" /> Gadgets & E-Documents
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            Secure payments. Instantly download digital documents or track courier dispatches for top-tier gear.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-24 space-y-10">
        
        {/* Track Order Card Section */}
        <Card className="border-border bg-white/[0.01]">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Track & Verify Invoice
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check purchase status or match a bKash Personal invoice using your unique Transaction ID.
                </p>
              </div>
              <form onSubmit={handleOrderSearch} className="flex gap-2 w-full lg:max-w-md">
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-D56C1B or gateway TrxID"
                  className="flex h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3.5 py-2 text-sm placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" isLoading={searchLoading} className="shrink-0 font-bold">
                  Verify
                </Button>
              </form>
            </div>
            {searchError && (
              <p className="text-xs text-destructive mt-3.5 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> {searchError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Filter and Product Grid Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Catalog Releases
            </h2>
            
            {/* Search + Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  className="h-9 pl-9 pr-4 w-full rounded-lg border border-border bg-white/[0.02] text-xs placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              <div className="flex border border-border bg-white/5 rounded-lg p-0.5 select-none">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategoryFilter('digital')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${categoryFilter === 'digital' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Digital
                </button>
                <button
                  onClick={() => setCategoryFilter('physical')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${categoryFilter === 'physical' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Physical
                </button>
              </div>
            </div>
          </div>

          {/* Grid display: 4 columns desktop, 2 tablet, 1 mobile */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3 rounded-2xl border border-dashed border-border bg-white/[0.01] select-none">
              <div className="rounded-full bg-white/5 p-4 text-muted-foreground">
                <Filter className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search terms.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group relative flex flex-col justify-between overflow-hidden cursor-pointer border-border/60 bg-white/[0.01] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-1"
                >
                  <div>
                    {product.image_url ? (
                      <div className="relative w-full h-44 overflow-hidden bg-black/10 border-b border-border">
                        <img 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
                          src={product.image_url} 
                          alt={product.name} 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-white/[0.02] border-b border-border flex items-center justify-center text-muted-foreground text-xs font-medium">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <CardHeader className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        {product.is_digital ? (
                          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/25 text-emerald-400 py-0.5 text-[9px] font-bold select-none gap-1">
                            <FileText className="h-2.5 w-2.5" /> Digital
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/25 text-amber-400 py-0.5 text-[9px] font-bold select-none gap-1">
                            <Truck className="h-2.5 w-2.5" /> Physical
                          </Badge>
                        )}
                        {!product.is_digital && product.stock === 0 && (
                          <Badge variant="destructive" className="py-0.5 text-[9px] select-none">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground/95 line-clamp-1">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 pt-0.5">
                        {product.description || 'No description available.'}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardFooter className="p-4 pt-0 flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-base font-extrabold text-primary">${product.price}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        addToCart(product);
                        setIsCartOpen(true);
                      }}
                      disabled={!product.is_digital && product.stock === 0}
                      className="h-8 text-xs px-3 font-bold cursor-pointer"
                    >
                      Buy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Dialog Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        {selectedProduct && (
          <DialogContent className="max-w-xl bg-[#0f0f13] border border-border p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {selectedProduct.image_url ? (
                <div className="relative rounded-xl overflow-hidden bg-black/10 aspect-square border border-border/80">
                  <img className="w-full h-full object-cover" src={selectedProduct.image_url} alt={selectedProduct.name} />
                </div>
              ) : (
                <div className="rounded-xl bg-white/[0.02] aspect-square border border-border/80 flex items-center justify-center text-muted-foreground text-xs font-semibold">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}

              <div className="flex flex-col justify-between h-full gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedProduct.is_digital ? (
                      <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 py-0.5 font-bold gap-1">
                        <FileText className="h-3 w-3" /> E-Document PDF
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 py-0.5 font-bold gap-1">
                        <Truck className="h-3 w-3" /> Physical Item
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <div className="text-2xl font-black text-primary">
                    ${selectedProduct.price}
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> Product Details
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto pr-1">
                      {selectedProduct.description || 'No detailed specifications listed.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/60">
                  <div className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Availability: </strong>
                    {selectedProduct.is_digital ? (
                      <span className="text-emerald-400 font-semibold">Instant Download (Infinite Stock)</span>
                    ) : selectedProduct.stock > 0 ? (
                      <span className="text-emerald-400 font-semibold">{selectedProduct.stock} items remaining</span>
                    ) : (
                      <span className="text-destructive font-semibold">Out of Stock</span>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    disabled={!selectedProduct.is_digital && selectedProduct.stock === 0}
                    className="w-full py-2.5 h-11 text-xs font-bold cursor-pointer"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Shopping Cart Drawer Sheet */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {/* Checkout Form Modal */}
      <CheckoutForm 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        clearCart={clearCart}
      />
    </div>
  );
}
