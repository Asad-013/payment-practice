import React, { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { ShieldCheck, Truck, Sparkles, AlertCircle, AlertTriangle } from "lucide-react"
import axios from "axios"
import { CartItem } from "@/types"

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  clearCart: () => void;
}

export function CheckoutForm({ isOpen, onClose, cart, cartTotal, clearCart }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const isAllDigital = cart && cart.length > 0 && cart.every(item => item.product.is_digital)

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    setLoading(true)
    setErrorMsg("")

    try {
      const response = await axios.post("/api/payment/init", {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: isAllDigital ? "Digital Delivery" : customer.address,
        items: cart,
      })

      if (response.data?.paymentUrl) {
        // Clear local cart storage since transaction is initiated successfully
        clearCart()
        window.location.href = response.data.paymentUrl
      } else {
        setErrorMsg("Failed to initialize UddoktaPay session.")
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.error || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-[#0f0f13] border border-border p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Complete Checkout
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Provide your billing details to proceed to our secure payment gateway.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2 font-medium">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Asaduzzaman"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. customer@example.com"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="e.g. 01700000000"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />

          {!isAllDigital ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Shipping Address
              </label>
              <textarea
                required
                placeholder="e.g. House 42, Road 11, Dhanmondi, Dhaka"
                rows={2}
                className="flex w-full rounded-lg border border-border bg-white/[0.03] px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-400">Digital-only items inside:</strong> Shipping details skipped. Files will be unlocked instantly on verification.
              </div>
            </div>
          )}

          {/* Checkout Order Summary Card */}
          <div className="rounded-xl border border-border bg-white/[0.01] p-4 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Summary</h4>
            <div className="max-h-24 overflow-y-auto divide-y divide-border pr-2">
              {(cart || []).map((item) => (
                <div key={item.product.id} className="flex justify-between items-center py-2 text-xs text-foreground">
                  <span className="truncate max-w-[280px]">
                    {item.product.name} <span className="text-muted-foreground font-semibold">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="text-primary text-base">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Gateway bKash Warning */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-[11px] text-muted-foreground leading-normal space-y-1">
            <strong className="text-amber-400 flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" /> bKash Personal Checkout Notice
            </strong>
            <p>
              If paying via a **bKash Personal account**, copy the reference/invoice ID and submit the **TrxID** inside the payment window. Closed windows can be matched manually later.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1"
            >
              Pay with UddoktaPay
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
