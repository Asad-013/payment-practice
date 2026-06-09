import React from "react"
import { Button } from "@/components/ui/Button"
import { Trash2, Plus, Minus, ShoppingCart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

import { CartItem } from "@/types"

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  onProceedToCheckout,
  cart,
  cartCount,
  cartTotal,
  updateQuantity,
  removeFromCart
}: CartDrawerProps) {
  if (!isOpen) return null

  const isAllDigital = cart.length > 0 && cart.every(item => item.product.is_digital)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-[#0a0a0c]/95 backdrop-blur-2xl p-6 shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Shopping Cart</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {cartCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="rounded-full bg-white/5 p-4 text-muted-foreground">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Explore our products to add items.</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white/[0.01] p-3 hover:border-white/10 transition-colors"
              >
                {/* Product Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {item.product.name}
                    </h4>
                    {item.product.is_digital && (
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        📄 PDF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${item.product.price} each
                  </p>
                </div>

                {/* Qty and Remove Actions */}
                <div className="flex items-center gap-3 select-none">
                  <div className="flex items-center rounded-lg border border-border bg-white/5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1.5 hover:bg-white/5 rounded-l-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1.5 hover:bg-white/5 rounded-r-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                      disabled={!item.product.is_digital && item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Sum/Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-foreground">
              <span>Total:</span>
              <span className="text-primary text-xl">${cartTotal.toFixed(2)}</span>
            </div>

            {isAllDigital && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Digital E-Delivery:</strong> Direct download PDF buttons will be instantly unlocked on your receipt invoice once UddoktaPay checkout is verified.
                </span>
              </div>
            )}

            <Button onClick={onProceedToCheckout} className="w-full h-11 text-sm font-bold cursor-pointer">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
