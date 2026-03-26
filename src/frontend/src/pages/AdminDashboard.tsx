import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Package,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, OrderStatus, PaymentMethod, UserRole } from "../backend";
import type { Order, Product, ProductSize, ProductType } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useGetAllOrders,
  useGetAllProducts,
  useGetCallerUserRole,
  useGetUpiId,
  useSetUpiId,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const PRODUCT_TYPES: { label: string; value: string }[] = [
  { label: "Jeans", value: "Jeans" },
  { label: "Tops", value: "Tops" },
  { label: "Dresses", value: "Dresses" },
  { label: "Kurtas", value: "Kurtas" },
  { label: "Sarees", value: "Sarees" },
  { label: "Leggings", value: "Leggings" },
  { label: "Other", value: "Other" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function makeProductType(value: string): ProductType {
  switch (value) {
    case "Jeans":
      return { __kind__: "Jeans", Jeans: null };
    case "Tops":
      return { __kind__: "Tops", Tops: null };
    case "Dresses":
      return { __kind__: "Dresses", Dresses: null };
    case "Kurtas":
      return { __kind__: "Kurtas", Kurtas: null };
    case "Sarees":
      return { __kind__: "Sarees", Sarees: null };
    case "Leggings":
      return { __kind__: "Leggings", Leggings: null };
    default:
      return { __kind__: "Other", Other: value };
  }
}

function makeSizes(selected: string[]): ProductSize[] {
  return selected.map((s) => {
    switch (s) {
      case "XS":
        return { __kind__: "XS", XS: null };
      case "S":
        return { __kind__: "S", S: null };
      case "M":
        return { __kind__: "M", M: null };
      case "L":
        return { __kind__: "L", L: null };
      case "XL":
        return { __kind__: "XL", XL: null };
      case "XXL":
        return { __kind__: "XXL", XXL: null };
      default:
        return { __kind__: "Custom", Custom: s };
    }
  });
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.confirmed]: "bg-blue-100 text-blue-800",
  [OrderStatus.shipped]: "bg-purple-100 text-purple-800",
  [OrderStatus.delivered]: "bg-green-100 text-green-800",
  [OrderStatus.cancelled]: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const queryClient = useQueryClient();
  const [activating, setActivating] = useState(false);

  // Show loading while auth is initializing OR actor is being created
  if (isInitializing || actorFetching) {
    return (
      <div
        className="container py-16 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Login with Internet Identity to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              data-ocid="admin.login.primary_button"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                  in...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Login with Internet
                  Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div
        className="container py-16 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "admin") {
    const handleActivate = async () => {
      if (!actor || !identity) return;
      setActivating(true);
      try {
        await actor.initializeAccessControl();
        await actor.assignCallerUserRole(
          identity.getPrincipal(),
          UserRole.admin,
        );
        queryClient.invalidateQueries({ queryKey: ["userRole"] });
        queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
        toast.success("Admin access activated! Please wait...");
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Activation failed");
      } finally {
        setActivating(false);
      }
    };

    return (
      <div className="container py-16 max-w-md mx-auto">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have admin access yet. If you&apos;re the store
            owner, click below to activate.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Admin Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleActivate}
              disabled={activating}
              data-ocid="admin.activate.primary_button"
            >
              {activating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Activating...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Activate as Admin
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Manage your Yunazz Clothing store.
      </p>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            Orders
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="admin.payments.tab">
            Payments
          </TabsTrigger>
          <TabsTrigger value="contact" data-ocid="admin.contact.tab">
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsTab() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Kurtas",
    stock: "10",
    sizes: ["M", "L"],
  });
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setUploading(true);
    try {
      let imageUrls: ExternalBlob[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const bytes = new Uint8Array(await file.arrayBuffer());
            return ExternalBlob.fromBytes(bytes);
          }),
        );
      }

      const priceInPaise = Math.round(Number.parseFloat(form.price) * 100);
      const product: Product = {
        id: `PRD-${Date.now()}`,
        name: form.name,
        description: form.description,
        price: BigInt(priceInPaise),
        category: makeProductType(form.category),
        sizes: makeSizes(form.sizes),
        stockQuantity: BigInt(Number.parseInt(form.stock) || 10),
        imageUrls,
        createdAt: BigInt(Date.now()),
      };

      await addProduct.mutateAsync(product);
      toast.success("Product added successfully!");
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "Kurtas",
        stock: "10",
        sizes: ["M", "L"],
      });
      setImageFiles([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add product";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Products ({products.length})</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
          data-ocid="admin.products.add.primary_button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Cotton Anarkali Kurta"
                    required
                    data-ocid="admin.product.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="e.g. 599"
                    required
                    data-ocid="admin.product.price.input"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Product description..."
                  rows={2}
                  data-ocid="admin.product.description.textarea"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger data-ocid="admin.product.category.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    data-ocid="admin.product.stock.input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => (
                    <div key={size} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`size-${size}`}
                        checked={form.sizes.includes(size)}
                        onCheckedChange={(checked) =>
                          setForm((f) => ({
                            ...f,
                            sizes: checked
                              ? [...f.sizes, size]
                              : f.sizes.filter((s) => s !== size),
                          }))
                        }
                        data-ocid="admin.product.sizes.checkbox"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="cursor-pointer"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Product Images</Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                  data-ocid="admin.product.images.dropzone"
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {imageFiles.length > 0
                      ? `${imageFiles.length} image(s) selected`
                      : "Click to upload product images"}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      setImageFiles(Array.from(e.target.files ?? []))
                    }
                    data-ocid="admin.product.images.upload_button"
                  />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-ocid="admin.product.cancel.button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={uploading || addProduct.isPending}
                  data-ocid="admin.product.save.primary_button"
                >
                  {uploading || addProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.products.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.products.empty_state"
        >
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, idx) => (
            <ProductRow
              key={product.id}
              product={product}
              index={idx + 1}
              onDelete={() =>
                deleteProduct
                  .mutateAsync(product.id)
                  .then(() => toast.success("Product deleted"))
                  .catch((e: Error) => toast.error(e.message))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  index,
  onDelete,
}: { product: Product; index: number; onDelete: () => void }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product.imageUrls.length > 0) {
      try {
        setImgUrl(product.imageUrls[0].getDirectURL());
      } catch {
        // ignore
      }
    }
  }, [product.imageUrls]);

  const catLabel =
    product.category.__kind__ === "Other"
      ? (product.category as { __kind__: "Other"; Other: string }).Other
      : product.category.__kind__;

  return (
    <div
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
      data-ocid={`admin.products.item.${index}`}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={product.name}
          className="w-14 h-14 object-cover rounded-md"
        />
      ) : (
        <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground opacity-40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {catLabel} &middot; Stock: {Number(product.stockQuantity)}
        </p>
      </div>
      <p className="font-semibold text-primary text-sm">
        ₹{(Number(product.price) / 100).toFixed(0)}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive/80"
        onClick={onDelete}
        data-ocid={`admin.products.delete_button.${index}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success("Order status updated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update status";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="admin.orders.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="admin.orders.empty_state"
      >
        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No orders yet</p>
        <p className="text-sm">Orders placed by customers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="admin.orders.table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: Order, idx: number) => (
            <TableRow key={order.id} data-ocid={`admin.orders.row.${idx + 1}`}>
              <TableCell className="font-mono text-xs">{order.id}</TableCell>
              <TableCell>
                <p className="font-medium text-sm">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customerPhone}
                </p>
              </TableCell>
              <TableCell className="text-xs max-w-[150px] truncate">
                {order.customerAddress}
              </TableCell>
              <TableCell className="text-xs">
                {order.items
                  .map((i) => `${i.productName} x${Number(i.quantity)}`)
                  .join(", ")}
              </TableCell>
              <TableCell className="font-semibold text-primary">
                ₹{(Number(order.totalAmount) / 100).toFixed(0)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {order.paymentMethod === PaymentMethod.cashOnDelivery
                    ? "COD"
                    : order.paymentMethod === PaymentMethod.upi
                      ? "UPI"
                      : "Card"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Select
                  value={order.status}
                  onValueChange={(v) =>
                    handleStatusChange(order.id, v as OrderStatus)
                  }
                >
                  <SelectTrigger
                    className="h-7 text-xs w-32 mt-1"
                    data-ocid="admin.orders.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.confirmed}>
                      Confirmed
                    </SelectItem>
                    <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                    <SelectItem value={OrderStatus.delivered}>
                      Delivered
                    </SelectItem>
                    <SelectItem value={OrderStatus.cancelled}>
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentsTab() {
  const { data: savedUpiId = "", isLoading } = useGetUpiId();
  const setUpiIdMutation = useSetUpiId();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (savedUpiId) setInput(savedUpiId);
  }, [savedUpiId]);

  const handleSave = async () => {
    if (!input.trim()) {
      toast.error("Please enter a UPI ID");
      return;
    }
    try {
      await setUpiIdMutation.mutateAsync(input.trim());
      toast.success("UPI ID saved successfully!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save UPI ID";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UPI Payment Setup</CardTitle>
          <CardDescription>
            Your UPI ID will be shown to customers at checkout so they can pay
            you directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton
              className="h-10 w-full"
              data-ocid="admin.payments.loading_state"
            />
          ) : (
            <>
              {savedUpiId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium">
                    Current UPI ID:
                  </p>
                  <p className="font-mono text-sm font-bold text-green-800">
                    {savedUpiId}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <Label>Your UPI ID</Label>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. 9876543210@paytm or yourname@gpay"
                  data-ocid="admin.payments.upi.input"
                />
                <p className="text-xs text-muted-foreground">
                  Customers will see this UPI ID at checkout (Google Pay,
                  PhonePe, Paytm, etc.)
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={setUpiIdMutation.isPending}
                className="bg-primary hover:bg-primary/90"
                data-ocid="admin.payments.save.primary_button"
              >
                {setUpiIdMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save UPI ID
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash on Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            COD is automatically available for all customers. When a customer
            chooses COD, you collect payment at delivery via your courier
            partner.
          </p>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Recommended couriers for fastest COD settlements: Delhivery
            (1&ndash;2 days), Shadowfax (48 hrs), Blue Dart (1&ndash;3 days).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ContactTab() {
  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Store Contact Information</CardTitle>
          <CardDescription>
            This information is displayed to customers in the footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <span className="text-2xl">📞</span>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-semibold">8904107520</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-semibold">ymd72675@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <span className="text-2xl">📸</span>
            <div>
              <p className="text-xs text-muted-foreground">Instagram</p>
              <p className="font-semibold">@yunazzclotheshub</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
