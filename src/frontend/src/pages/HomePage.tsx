import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  MessageSquare,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProductCard, {
  formatPrice,
  getProductTypeLabel,
  getSizeLabel,
} from "../components/ProductCard";
import ReviewDialog, {
  StarRating,
  getReviews,
} from "../components/ReviewDialog";
import type { Review } from "../components/ReviewDialog";
import { useCart } from "../context/CartContext";
import {
  useGetAllProducts,
  useGetUpiId,
  usePlaceOrder,
} from "../hooks/useQueries";
import type { Order, OrderItem } from "../types";
import { OrderStatus, PaymentMethod } from "../types";

export default function HomePage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const {
    items,
    isOpen,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    total,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [reviewDialogState, setReviewDialogState] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: "", productName: "" });

  useEffect(() => {
    const all = getReviews();
    const sorted = [...all]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    setRecentReviews(sorted);
  }, []);

  const refreshReviews = () => {
    const all = getReviews();
    const sorted = [...all]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    setRecentReviews(sorted);
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((p) => getProductTypeLabel(p.category))),
    ),
  ];
  const filtered =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => getProductTypeLabel(p.category) === selectedCategory,
        );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-yunazz.dim_1200x500.jpg"
          alt="Yunazz Clothing — Western Fashion for Women"
          className="w-full h-64 sm:h-80 md:h-[420px] object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent flex flex-col justify-center px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Yunazz Clothing
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-md">
              Discover trendy western fashion for women — Dresses, Tops, Jeans
              &amp; more.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="hero.shop_button"
            >
              Shop Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Models / Collections Showcase */}
      <section className="container py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Explore Our Collections
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Curated western styles for every occasion — from casual chic to
            evening glamour.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Women's Model Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer bg-card border border-border"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            tabIndex={0}
            aria-label="Browse Women's Collection"
            data-ocid="models.female.card"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src="/assets/generated/western-women-model-1.dim_600x800.jpg"
                alt="Women's Collection"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-start gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  New Arrivals
                </span>
                <h3 className="text-white font-display text-xl sm:text-2xl font-bold leading-tight">
                  Women's Collection
                </h3>
              </div>
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-white text-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="models.female.primary_button"
              >
                Shop Now
              </button>
            </div>
          </motion.div>

          {/* Women's Model Card 2 - Trendy Styles */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer bg-card border border-border"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            tabIndex={0}
            aria-label="Browse Trendy Styles"
            data-ocid="models.trendy.card"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src="/assets/generated/western-women-model-2.dim_600x800.jpg"
                alt="Trendy Styles"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-start gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  New Arrivals
                </span>
                <h3 className="text-white font-display text-xl sm:text-2xl font-bold leading-tight">
                  Trendy Styles
                </h3>
              </div>
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-white text-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="models.trendy.primary_button"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="container py-12">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">
          Our Collection
        </h2>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}
              data-ocid="products.filter.tab"
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="products.loading_state"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="products.empty_state"
          >
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No products available yet.</p>
            <p className="text-sm">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx + 1}
                onAddToCart={addItem}
                onReviewOpen={(id, name) =>
                  setReviewDialogState({
                    open: true,
                    productId: id,
                    productName: name,
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews Section */}
      <section className="container py-12 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            What our customers are saying
          </p>

          {recentReviews.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl"
              data-ocid="reviews.empty_state"
            >
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm">Be the first to review a product!</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="reviews.list"
            >
              {recentReviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm"
                  data-ocid={`reviews.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {review.customerName}
                    </span>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <p className="text-xs text-primary font-medium mb-1">
                    {review.productName}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Cart Sidebar */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent
          side="right"
          className="w-full sm:w-96 flex flex-col"
          data-ocid="cart.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display text-xl">
              Your Cart ({items.length})
            </SheetTitle>
          </SheetHeader>
          {items.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground"
              data-ocid="cart.empty_state"
            >
              <ShoppingBag className="h-12 w-12 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size.__kind__}`}
                    className="flex gap-3"
                    data-ocid={`cart.item.${idx + 1}`}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {getSizeLabel(item.size)}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          data-ocid={`cart.delete_button.${idx + 1}`}
                          aria-label={`Remove ${item.productName} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    closeCart();
                    setCheckoutOpen(true);
                  }}
                  data-ocid="cart.checkout.primary_button"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      {/* Global Review Dialog */}
      <ReviewDialog
        open={reviewDialogState.open}
        onClose={() => {
          setReviewDialogState((s) => ({ ...s, open: false }));
          refreshReviews();
        }}
        productId={reviewDialogState.productId}
        productName={reviewDialogState.productName}
      />
    </>
  );
}

function CheckoutDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { items, total, clearCart } = useCart();
  const { data: upiId = "" } = useGetUpiId();
  const placeOrder = usePlaceOrder();

  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("cod");

  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: BigInt(i.quantity),
      price: i.price,
      size: i.size,
    }));

    const order: Order = {
      id: `ORD-${Date.now()}`,
      customerName: form.name,
      customerPhone: form.phone,
      customerAddress: form.address,
      customerId: form.email || form.phone,
      items: orderItems,
      totalAmount: total,
      paymentMethod:
        paymentMethod === "upi"
          ? PaymentMethod.upi
          : PaymentMethod.cashOnDelivery,
      status: OrderStatus.pending,
      createdAt: BigInt(Date.now()),
    };

    try {
      await placeOrder.mutateAsync(order);
      setStep("success");
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("details");
      setForm({ name: "", email: "", phone: "", address: "" });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md" data-ocid="checkout.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "success"
              ? "Order Placed! 🎉"
              : step === "payment"
                ? "Payment"
                : "Delivery Details"}
          </DialogTitle>
        </DialogHeader>

        {step === "details" && (
          <form onSubmit={handleDetails} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your full name"
                required
                data-ocid="checkout.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email (for order tracking)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="your@email.com"
                data-ocid="checkout.email.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="10-digit mobile number"
                required
                data-ocid="checkout.phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Delivery Address *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Full delivery address with PIN code"
                required
                data-ocid="checkout.address.input"
              />
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Order Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              data-ocid="checkout.details.primary_button"
            >
              Continue to Payment
            </Button>
          </form>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "upi" | "cod")}
            >
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="font-medium cursor-pointer">
                    Pay via UPI
                  </Label>
                </div>
                {paymentMethod === "upi" && upiId && (
                  <div className="bg-secondary/50 rounded-lg p-3 ml-6">
                    <p className="text-xs text-muted-foreground mb-1">
                      Send payment to this UPI ID:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-primary text-sm">
                        {upiId}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(upiId);
                          toast.success("UPI ID copied!");
                        }}
                        className="text-muted-foreground hover:text-primary"
                        data-ocid="checkout.upi.copy.button"
                        aria-label="Copy UPI ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📱 Open Google Pay, PhonePe, or Paytm &rarr; Send money to
                      above UPI ID &rarr; Place your order.
                    </p>
                  </div>
                )}
                {paymentMethod === "upi" && !upiId && (
                  <p className="text-xs text-muted-foreground ml-6">
                    UPI payment setup in progress. Please use COD.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-4">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer">
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Pay when your order arrives
                  </p>
                </Label>
              </div>
            </RadioGroup>

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total to Pay</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                data-ocid="checkout.back.button"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                data-ocid="checkout.place_order.primary_button"
              >
                {placeOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div
            className="text-center space-y-4 py-4"
            data-ocid="checkout.success_state"
          >
            <div className="text-5xl">🎉</div>
            <h3 className="font-display text-xl font-bold">
              Order Placed Successfully!
            </h3>
            <p className="text-muted-foreground text-sm">
              Thank you, {form.name}! We have received your order and will
              prepare it soon.
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-1">
              <p>
                📦 <strong>Status:</strong> Order received, being prepared
              </p>
              <p>
                📱 <strong>Track:</strong> Visit &ldquo;My Orders&rdquo; and
                enter your phone number
              </p>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleClose}
              data-ocid="checkout.close.button"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
