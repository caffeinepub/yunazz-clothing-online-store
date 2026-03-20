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
import { Loader2, Settings, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import ContactInfoManagement from "../components/admin/ContactInfoManagement";
import ProductManagement from "../components/admin/ProductManagement";
import StripeSetup from "../components/admin/StripeSetup";
import { useActor } from "../hooks/useActor";
import {
  useGetAllProducts,
  useGetCallerUserRole,
  useInitializeAccessControl,
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
  const initializeAccessControl = useInitializeAccessControl();

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

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="products">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductManagement />
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
