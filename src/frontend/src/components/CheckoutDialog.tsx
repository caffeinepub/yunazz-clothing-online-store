import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CreditCard, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, PaymentMethod } from "../backend";
import type { Product, ProductSize } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetCallerUserProfile,
  usePlaceOrder,
} from "../hooks/useQueries";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  selectedSize: ProductSize;
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  product,
  selectedSize,
}: CheckoutDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [paymentMethod, setPaymentMethod] = useState<
    "upi" | "card" | "cashOnDelivery"
  >("cashOnDelivery");
  const createCheckoutSession = useCreateCheckoutSession();
  const placeOrder = usePlaceOrder();

  const isAuthenticated = !!identity;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to place an order");
      return;
    }

    if (!userProfile) {
      toast.error("Please complete your profile first");
      return;
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Map string to PaymentMethod enum
    let paymentMethodEnum: PaymentMethod;
    switch (paymentMethod) {
      case "upi":
        paymentMethodEnum = PaymentMethod.upi;
        break;
      case "card":
        paymentMethodEnum = PaymentMethod.card;
        break;
      case "cashOnDelivery":
        paymentMethodEnum = PaymentMethod.cashOnDelivery;
        break;
    }

    const order = {
      id: orderId,
      user: identity!.getPrincipal(),
      products: [product],
      totalAmount: product.price,
      paymentMethod: paymentMethodEnum,
      status: OrderStatus.pending,
      timestamp: BigInt(Date.now() * 1000000),
      deliveryAddress: userProfile.address || "",
    };

    try {
      if (paymentMethod === "card") {
        // Stripe checkout - create session and redirect
        const shoppingItems = [
          {
            productName: product.name,
            productDescription: product.description,
            priceInCents: product.price * BigInt(100), // Convert to cents
            quantity: BigInt(1),
            currency: "inr",
          },
        ];

        const session = await createCheckoutSession.mutateAsync(shoppingItems);

        // Validate session URL before redirecting
        if (!session?.url || session.url.trim() === "") {
          throw new Error("Stripe session missing url");
        }

        // Place order before redirecting
        await placeOrder.mutateAsync(order);

        // Redirect using window.location.href (not router navigation)
        window.location.href = session.url;
      } else if (paymentMethod === "upi") {
        // UPI payment - place order and show confirmation
        await placeOrder.mutateAsync(order);
        toast.success(
          "Order placed successfully! Please complete UPI payment.",
        );
        onOpenChange(false);
      } else {
        // Cash on Delivery - place order and show confirmation
        await placeOrder.mutateAsync(order);
        toast.success(
          "Order placed successfully! Payment will be collected on delivery.",
        );
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order");
    }
  };

  const getSizeLabel = (size: ProductSize): string => {
    if ("Custom" in size) return size.Custom;
    return size.__kind__;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
            <h3 className="font-semibold text-base">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{getSizeLabel(selectedSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">₹{Number(product.price)}</span>
            </div>
            {userProfile?.address && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deliver to:</span>
                <span className="font-medium text-right max-w-[60%]">
                  {userProfile.address}
                </span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span>Total:</span>
              <span className="text-primary">₹{Number(product.price)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Select Payment Method
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: any) => setPaymentMethod(value)}
            >
              {/* UPI Payment */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="upi" id="upi" />
                <Label
                  htmlFor="upi"
                  className="flex-1 cursor-pointer flex items-center gap-3"
                >
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">UPI</p>
                    <p className="text-xs text-muted-foreground">
                      Pay using UPI apps like Google Pay, PhonePe, Paytm
                    </p>
                  </div>
                </Label>
              </div>

              {/* Card Payment via Stripe */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label
                  htmlFor="card"
                  className="flex-1 cursor-pointer flex items-center gap-3"
                >
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Card</p>
                    <p className="text-xs text-muted-foreground">
                      Secure payment via Stripe
                    </p>
                  </div>
                </Label>
              </div>

              {/* Cash on Delivery */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="cashOnDelivery" id="cod" />
                <Label
                  htmlFor="cod"
                  className="flex-1 cursor-pointer flex items-center gap-3"
                >
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Cash on Delivery (COD)</p>
                    <p className="text-xs text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Checkout Button */}
          <Button
            data-ocid="checkout.submit_button"
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            disabled={createCheckoutSession.isPending || placeOrder.isPending}
          >
            {(createCheckoutSession.isPending || placeOrder.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {paymentMethod === "card" ? "Proceed to Payment" : "Place Order"}
          </Button>

          {/* Payment Info */}
          <p className="text-xs text-center text-muted-foreground">
            {paymentMethod === "card" &&
              "You will be redirected to Stripe for secure payment"}
            {paymentMethod === "upi" &&
              "Complete payment using your preferred UPI app"}
            {paymentMethod === "cashOnDelivery" &&
              "Pay in cash when your order is delivered"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
