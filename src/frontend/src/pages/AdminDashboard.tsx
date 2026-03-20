import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ContactInfoManagement from "../components/admin/ContactInfoManagement";
import OrdersManagement from "../components/admin/OrdersManagement";
import ProductManagement from "../components/admin/ProductManagement";
import StripeSetup from "../components/admin/StripeSetup";
import { useActor } from "../hooks/useActor";
import {
  useGetAllOrders,
  useGetAllProducts,
  useGetCallerUserRole,
  useInitializeAccessControl,
  useIsStripeConfigured,
} from "../hooks/useQueries";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const {
    data: userRole,
    isLoading: roleLoading,
    isPending: rolePending,
  } = useGetCallerUserRole();
  const { data: products = [] } = useGetAllProducts();
  const { data: orders = [] } = useGetAllOrders();
  const { data: isStripeConfigured = false } = useIsStripeConfigured();
  const initializeAccessControl = useInitializeAccessControl();
  const [activeTab, setActiveTab] = useState("products");

  const handleActivateAdmin = async () => {
    try {
      await initializeAccessControl.mutateAsync();
      toast.success("Admin access activated successfully!");
    } catch (error: any) {
      let errorMessage = "An error occurred";
      if (typeof error === "string") errorMessage = error;
      else if (error?.message) errorMessage = error.message;
      toast.error(`Failed to activate admin: ${errorMessage}`);
      console.error("Admin activation error:", error);
    }
  };

  if (actorFetching || roleLoading || rolePending) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="container py-16 max-w-lg mx-auto">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You do not have admin access. If you are the store owner, activate
            your admin account below.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Admin Setup Required
            </CardTitle>
            <CardDescription>
              No admin has been set up yet. Click below to activate your account
              as the store admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="admin.activate_button"
              onClick={handleActivateAdmin}
              disabled={initializeAccessControl.isPending}
              className="w-full"
            >
              {initializeAccessControl.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Activate as Admin
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your store products, payments, and settings
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/admin" })}
          variant="outline"
          size="default"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Admin
        </Button>
      </div>

      {/* Stripe setup notice */}
      {!isStripeConfigured && (
        <Alert className="mb-6 border-amber-400 bg-amber-50 dark:bg-amber-950/20">
          <CreditCard className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-amber-800 dark:text-amber-300 font-medium">
              Card payments are not set up yet. Go to the Payments tab to add
              your Stripe key and start accepting card payments.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 shrink-0"
              onClick={() => setActiveTab("payments")}
              data-ocid="admin.setup_payments_button"
            >
              Set Up Payments
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            data-ocid="admin.payments.tab"
            className="relative"
          >
            Payments
            {!isStripeConfigured && (
              <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-orange-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="contact" data-ocid="admin.contact.tab">
            Contact Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <StripeSetup />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <ContactInfoManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
