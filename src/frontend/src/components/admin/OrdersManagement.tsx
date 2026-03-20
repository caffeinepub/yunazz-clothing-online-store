import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "../../backend";
import { useGetAllOrders, useUpdateOrderStatus } from "../../hooks/useQueries";

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.confirmed]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.shipped]: "bg-purple-100 text-purple-800 border-purple-200",
  [OrderStatus.delivered]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.cancelled]: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Pending",
  [OrderStatus.confirmed]: "Confirmed",
  [OrderStatus.shipped]: "Shipped",
  [OrderStatus.delivered]: "Delivered",
  [OrderStatus.cancelled]: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  cashOnDelivery: "COD",
};

export default function OrdersManagement() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success("Order status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  if (isLoading) {
    return (
      <div data-ocid="orders.loading_state" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        data-ocid="orders.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <ShoppingBag className="h-14 w-14 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          No orders yet
        </h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Orders from your customers will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {orders.map((order, idx) => (
          <Card
            key={order.id}
            data-ocid={`orders.item.${idx + 1}`}
            className="border border-border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-mono">
                    #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(
                      Number(order.timestamp) / 1_000_000,
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  className={`text-xs border ${STATUS_COLORS[order.status as OrderStatus]}`}
                >
                  {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Products: </span>
                <span className="font-medium">
                  {order.products.map((p) => p.name).join(", ")}
                </span>
              </div>

              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">
                  {order.deliveryAddress || (
                    <span className="text-muted-foreground italic">
                      No address provided
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Total: </span>
                  <span className="font-semibold text-primary">
                    ₹{Number(order.totalAmount)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    via{" "}
                    {PAYMENT_LABELS[order.paymentMethod as string] ??
                      order.paymentMethod}
                  </span>
                </div>
              </div>

              <Select
                value={order.status as string}
                onValueChange={(val) =>
                  handleStatusChange(order.id, val as OrderStatus)
                }
              >
                <SelectTrigger
                  data-ocid={`orders.select.${idx + 1}`}
                  className="h-8 text-xs"
                >
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <Table data-ocid="orders.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Products</TableHead>
              <TableHead className="font-semibold">Delivery Address</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, idx) => (
              <TableRow
                key={order.id}
                data-ocid={`orders.row.${idx + 1}`}
                className="hover:bg-muted/20"
              >
                <TableCell>
                  <div>
                    <p className="font-mono text-xs font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        Number(order.timestamp) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs text-muted-foreground">
                    {order.user.toString().slice(0, 12)}...
                  </p>
                </TableCell>
                <TableCell>
                  <div className="max-w-[160px]">
                    {order.products.map((p, i) => (
                      <span key={p.id} className="text-sm">
                        {p.name}
                        {i < order.products.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1.5 max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm leading-tight">
                      {order.deliveryAddress || (
                        <span className="text-muted-foreground italic text-xs">
                          Not provided
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-primary">
                    ₹{Number(order.totalAmount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {PAYMENT_LABELS[order.paymentMethod as string] ??
                      order.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs border ${STATUS_COLORS[order.status as OrderStatus]}`}
                  >
                    {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status as string}
                    onValueChange={(val) =>
                      handleStatusChange(order.id, val as OrderStatus)
                    }
                  >
                    <SelectTrigger
                      data-ocid={`orders.select.${idx + 1}`}
                      className="h-8 w-32 text-xs"
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrderStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
