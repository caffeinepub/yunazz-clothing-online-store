import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search } from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend";
import { OrderStatus } from "../backend";
import { useGetOrdersByCustomerId } from "../hooks/useQueries";

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(0)}`;
}

const STATUS_STEPS = [
  { key: OrderStatus.pending, label: "Ordered" },
  { key: OrderStatus.confirmed, label: "Confirmed" },
  { key: OrderStatus.shipped, label: "Shipped" },
  { key: OrderStatus.delivered, label: "Delivered" },
];

const STATUS_MESSAGES: Record<OrderStatus, { message: string; emoji: string }> =
  {
    [OrderStatus.pending]: {
      message: "Order placed! We're preparing your order.",
      emoji: "📦",
    },
    [OrderStatus.confirmed]: {
      message: "Payment received! Your order is being prepared.",
      emoji: "✅",
    },
    [OrderStatus.shipped]: {
      message:
        "Your order is on the way! Our delivery partner is bringing it to you.",
      emoji: "🚚",
    },
    [OrderStatus.delivered]: {
      message:
        "Your order has been delivered! Thank you for shopping with Yunazz Clothing.",
      emoji: "🎉",
    },
    [OrderStatus.cancelled]: {
      message: "Your order has been cancelled.",
      emoji: "❌",
    },
  };

function getProgressValue(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.pending:
      return 10;
    case OrderStatus.confirmed:
      return 40;
    case OrderStatus.shipped:
      return 70;
    case OrderStatus.delivered:
      return 100;
    default:
      return 0;
  }
}

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");

  const { data: orders = [], isLoading } = useGetOrdersByCustomerId(searched);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(query.trim());
  };

  return (
    <section className="container py-12 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">
        Enter your email or phone number to track your orders.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="flex-1">
          <Label htmlFor="orderQuery" className="sr-only">
            Email or Phone
          </Label>
          <Input
            id="orderQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your email or phone number"
            data-ocid="orders.search_input"
          />
        </div>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          data-ocid="orders.search.primary_button"
        >
          <Search className="h-4 w-4 mr-2" />
          Track
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-4" data-ocid="orders.loading_state">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && searched && orders.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="orders.empty_state"
        >
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders found</p>
          <p className="text-sm">Try a different email or phone number.</p>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order, idx) => (
          <OrderCard key={order.id} order={order} index={idx + 1} />
        ))}
      </div>
    </section>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const statusInfo =
    STATUS_MESSAGES[order.status] ?? STATUS_MESSAGES[OrderStatus.pending];
  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const progress = getProgressValue(order.status);

  const date = new Date(Number(order.createdAt)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="shadow-card" data-ocid={`orders.item.${index}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold font-mono">
            {order.id}
          </CardTitle>
          <Badge
            className={
              {
                [OrderStatus.pending]: "bg-yellow-100 text-yellow-800",
                [OrderStatus.confirmed]: "bg-blue-100 text-blue-800",
                [OrderStatus.shipped]: "bg-purple-100 text-purple-800",
                [OrderStatus.delivered]: "bg-green-100 text-green-800",
                [OrderStatus.cancelled]: "bg-red-100 text-red-800",
              }[order.status] ?? ""
            }
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status message */}
        <div className="bg-secondary/50 rounded-lg p-3 flex gap-2">
          <span className="text-xl">{statusInfo.emoji}</span>
          <p className="text-sm">{statusInfo.message}</p>
        </div>

        {/* Progress bar */}
        {order.status !== OrderStatus.cancelled && (
          <div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STATUS_STEPS.map((step, i) => (
                <span
                  key={step.key}
                  className={i <= stepIdx ? "text-primary font-medium" : ""}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Order items */}
        <div className="space-y-1">
          {order.items.map((item) => (
            <div
              key={`${item.productId}-${item.size.__kind__}`}
              className="flex justify-between text-sm"
            >
              <span>
                {item.productName} × {Number(item.quantity)} (
                {item.size.__kind__})
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(order.totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
