import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole, useGetAllProducts, useIsStripeConfigured } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import StripeSetup from '../components/admin/StripeSetup';
import ContactInfoManagement from '../components/admin/ContactInfoManagement';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: products = [] } = useGetAllProducts();
  const { data: stripeConfigured = false } = useIsStripeConfigured();

  if (roleLoading) {
    return (
      <div className="container py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Only administrators can access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your store products, payments, and settings</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
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
