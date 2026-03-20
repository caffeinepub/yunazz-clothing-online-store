import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Package, ShoppingBag } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetOrdersByUser } from "../hooks/useQueries";

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal();

  const { data: orders = [], isLoading } = useGetOrdersByUser(principal);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>
            Please log in to view your orders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "default";
      case "confirmed":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      case "cashOnDelivery":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {["s1", "s2", "s3"].map((sk) => (
              <div key={sk} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          My Orders
        </h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here
          </p>
          <Button asChild>
            <Link to="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(
                        Number(order.timestamp) / 1000000,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {order.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 py-2 border-b last:border-0"
                      >
                        {product.images.length > 0 && (
                          <img
                            src={product.images[0].getDirectURL()}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{Number(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{Number(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
