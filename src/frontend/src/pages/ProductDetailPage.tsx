import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProductById } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductSize } from '../backend';
import CheckoutDialog from '../components/CheckoutDialog';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProductById(productId);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setCheckoutOpen(true);
  };

  const getSizeLabel = (size: ProductSize): string => {
    if ('Custom' in size) return size.Custom;
    return size.__kind__;
  };

  const getProductTypeLabel = (type: any): string => {
    if ('Other' in type) return type.Other;
    return type.__kind__;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate({ to: '/products' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/products' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          {product.images.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.getDirectURL()}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-primary">₹{Number(product.price)}</p>
              <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            <Badge variant="outline">{getProductTypeLabel(product.productType)}</Badge>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Size</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size, index) => {
                const sizeLabel = getSizeLabel(size);
                const isSelected = selectedSize && getSizeLabel(selectedSize) === sizeLabel;
                return (
                  <Button
                    key={index}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[60px]"
                  >
                    {sizeLabel}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Stock Info */}
          {product.isAvailable && (
            <p className="text-sm text-muted-foreground">
              {Number(product.stockCount)} items available
            </p>
          )}

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.isAvailable || !selectedSize}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.isAvailable ? 'Buy Now' : 'Out of Stock'}
          </Button>
        </div>
      </div>

      {product && selectedSize && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          product={product}
          selectedSize={selectedSize}
        />
      )}
    </div>
  );
}
