import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "../context/CartContext";
import type { Product, ProductSize, ProductType } from "../types";
import { StarRating, getAverageRating } from "./ReviewDialog";

export function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(0)}`;
}

export function getProductTypeLabel(cat: ProductType): string {
  return cat.__kind__ === "Other"
    ? (cat as { __kind__: "Other"; Other: string }).Other
    : cat.__kind__;
}

export function getSizeLabel(size: ProductSize): string {
  return size.__kind__ === "Custom"
    ? (size as { __kind__: "Custom"; Custom: string }).Custom
    : size.__kind__;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Dresses: "bg-pink-100 text-pink-700",
  Tops: "bg-rose-100 text-rose-700",
  Jeans: "bg-blue-100 text-blue-700",
  Kurtas: "bg-orange-100 text-orange-700",
  Sarees: "bg-purple-100 text-purple-700",
  Leggings: "bg-teal-100 text-teal-700",
  Other: "bg-secondary text-secondary-foreground",
};

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (item: CartItem) => void;
  onReviewOpen?: (productId: string, productName: string) => void;
}

export default function ProductCard({
  product,
  index,
  onAddToCart,
  onReviewOpen,
}: ProductCardProps) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    product.sizes.length > 0 ? product.sizes[0] : null,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { avg, count } = getAverageRating(product.id);
  const catLabel = getProductTypeLabel(product.category);
  const isOutOfStock = product.stockQuantity === BigInt(0);

  useEffect(() => {
    if (product.imageUrls.length > 0) {
      const blob = product.imageUrls[0];
      try {
        setImageUrl(blob.getDirectURL());
      } catch {
        blob
          .getBytes()
          .then((bytes) => {
            const url = URL.createObjectURL(new Blob([bytes]));
            setImageUrl(url);
          })
          .catch(() => {});
      }
    }
  }, [product.imageUrls]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    onAddToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      imageUrl: imageUrl ?? undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleCardClick = () => {
    navigate({ to: "/product/$id", params: { id: product.id } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="group bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={handleCardClick}
      data-ocid={`products.item.${index}`}
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-40" />
          </div>
        )}
        {/* Category badge */}
        <Badge
          className={`absolute top-2 left-2 text-xs border-0 pointer-events-none ${
            CATEGORY_COLORS[catLabel] ??
            "bg-secondary text-secondary-foreground"
          }`}
        >
          {catLabel}
        </Badge>
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-foreground text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* View Details hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-card text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            View Details
          </span>
        </div>
      </div>

      {/* Info */}
      <div
        className="p-3 flex flex-col flex-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          className="font-semibold text-sm truncate mb-1 cursor-pointer hover:text-primary transition-colors text-left w-full"
          onClick={handleCardClick}
          aria-label={`View ${product.name} details`}
        >
          {product.name}
        </button>

        {/* Star rating */}
        {count > 0 ? (
          <div className="flex items-center gap-1 mb-1">
            <StarRating rating={avg} size={12} />
            <span className="text-xs text-muted-foreground">
              {avg.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <div className="mb-1" />
        )}

        {/* Write review link */}
        {onReviewOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReviewOpen(product.id, product.name);
            }}
            className="text-xs text-primary hover:underline mb-2 block text-left"
            data-ocid={`products.review.button.${index}`}
          >
            ✍️ Write a Review
          </button>
        )}

        <p className="text-primary font-bold text-base mb-2">
          {formatPrice(product.price)}
        </p>

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <Select
            value={selectedSize ? getSizeLabel(selectedSize) : ""}
            onValueChange={(val) => {
              const found = product.sizes.find((s) => getSizeLabel(s) === val);
              if (found) setSelectedSize(found);
            }}
          >
            <SelectTrigger className="h-7 text-xs mb-2">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((s) => (
                <SelectItem key={getSizeLabel(s)} value={getSizeLabel(s)}>
                  {getSizeLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
            onClick={handleCardClick}
            data-ocid={`products.view.button.${index}`}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            data-ocid={`products.add_to_cart.button.${index}`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
