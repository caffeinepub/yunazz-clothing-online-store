import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { Product } from "../backend";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getProductTypeLabel = (type: any): string => {
    if ("Other" in type) return type.Other;
    return type.__kind__;
  };

  return (
    <Link to="/products/$productId" params={{ productId: product.id }}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          {product.images.length > 0 ? (
            <img
              src={product.images[0].getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {getProductTypeLabel(product.productType)}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ₹{Number(product.price)}
          </span>
          <Badge variant={product.isAvailable ? "default" : "secondary"}>
            {product.isAvailable ? "In Stock" : "Out of Stock"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
