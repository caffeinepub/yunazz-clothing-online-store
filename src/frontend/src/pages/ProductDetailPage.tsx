import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_COLORS,
  formatPrice,
  getProductTypeLabel,
  getSizeLabel,
} from "../components/ProductCard";
import ReviewDialog, {
  StarRating,
  getAverageRating,
  getProductReviews,
} from "../components/ReviewDialog";
import { useCart } from "../context/CartContext";
import { useGetAllProducts } from "../hooks/useQueries";
import type { ProductSize } from "../types";

export default function ProductDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const productId = params.id ?? "";
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { data: products = [], isLoading } = useGetAllProducts();
  const product = products.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviews, setReviews] = useState(() => getProductReviews(productId));
  const { avg, count } = getAverageRating(productId);

  // Set default size when product loads
  useEffect(() => {
    if (product && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

  // Load all product images
  useEffect(() => {
    if (!product) return;
    const urls: string[] = [];
    const loadImages = async () => {
      for (const blob of product.imageUrls) {
        try {
          urls.push(blob.getDirectURL());
        } catch {
          try {
            const bytes = await blob.getBytes();
            const url = URL.createObjectURL(new Blob([bytes]));
            urls.push(url);
          } catch {
            // skip failed image
          }
        }
      }
      setImageUrls(urls);
    };
    loadImages();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      imageUrl: imageUrls[0],
    });
    toast.success(`${product.name} added to cart!`);
  };

  const refreshReviews = () => {
    setReviews(getProductReviews(productId));
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container py-20 text-center"
        data-ocid="product.not_found"
      >
        <ShoppingBag className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">
          This product may have been removed or is no longer available.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const catLabel = getProductTypeLabel(product.category);
  const isOutOfStock = product.stockQuantity === BigInt(0);
  const currentImage = imageUrls[activeImageIndex];

  return (
    <>
      <div className="container py-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          data-ocid="product.back.button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            data-ocid="product.images"
          >
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden mb-3 shadow-sm">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
                </div>
              )}
              {imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((i) =>
                        i === 0 ? imageUrls.length - 1 : i - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-card/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((i) =>
                        i === imageUrls.length - 1 ? 0 : i + 1,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-card/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageUrls.map((_, i) => (
                      <button
                        // biome-ignore lint/suspicious/noArrayIndexKey: image index dots
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === activeImageIndex
                            ? "bg-primary w-4"
                            : "bg-card/70"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((url, i) => (
                  <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: thumbnail index
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
            data-ocid="product.details"
          >
            {/* Category & Stock */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={`text-xs border-0 ${
                  CATEGORY_COLORS[catLabel] ??
                  "bg-secondary text-secondary-foreground"
                }`}
              >
                {catLabel}
              </Badge>
              {isOutOfStock ? (
                <Badge
                  variant="outline"
                  className="text-xs text-destructive border-destructive/40"
                >
                  Out of Stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs text-green-700 border-green-300 bg-green-50"
                >
                  In Stock
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avg} size={16} />
                <span className="text-sm text-muted-foreground">
                  {avg.toFixed(1)} ({count} {count === 1 ? "review" : "reviews"}
                  )
                </span>
              </div>
            )}

            {/* Price */}
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>

            <Separator />

            {/* Description */}
            {product.description && (
              <div data-ocid="product.description">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Details / Fabric Section */}
            <div
              className="bg-secondary/40 rounded-xl p-4 space-y-2"
              data-ocid="product.fabric_details"
            >
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                Details
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{catLabel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Availability</span>
                  <p className="font-medium">
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${Number(product.stockQuantity)} in stock`}
                  </p>
                </div>
                {product.sizes.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      Sizes Available
                    </span>
                    <p className="font-medium">
                      {product.sizes.map(getSizeLabel).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div data-ocid="product.size_selector">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const label = getSizeLabel(size);
                    const isSelected =
                      selectedSize && getSizeLabel(selectedSize) === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-foreground border-border hover:border-primary hover:text-primary"
                        }`}
                        data-ocid={`product.size.${label}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please select a size to add to cart
                  </p>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                data-ocid="product.add_to_cart.primary_button"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="sm:flex-none border-primary/40 text-primary hover:bg-primary/10 h-12"
                onClick={() => setReviewOpen(true)}
                data-ocid="product.review.button"
              >
                <Star className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                🚚 <span>Pan-India delivery</span>
              </span>
              <span className="flex items-center gap-1">
                💳 <span>UPI &amp; COD accepted</span>
              </span>
              <span className="flex items-center gap-1">
                🔒 <span>Secure checkout</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section
          className="mt-16 pt-10 border-t border-border"
          data-ocid="product.reviews"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Customer Reviews
              </h2>
              {count > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Average rating: {avg.toFixed(1)} / 5 ({count}{" "}
                  {count === 1 ? "review" : "reviews"})
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewOpen(true)}
              className="border-primary/40 text-primary hover:bg-primary/10"
              data-ocid="product.write_review.button"
            >
              ✍️ Write a Review
            </Button>
          </div>

          {reviews.length === 0 ? (
            <div
              className="text-center py-12 bg-secondary/30 rounded-2xl text-muted-foreground"
              data-ocid="product.reviews.empty_state"
            >
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  className="bg-card border border-border rounded-xl p-4"
                  data-ocid={`product.review.${idx + 1}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {review.customerName}
                    </span>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ReviewDialog
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          refreshReviews();
        }}
        productId={product.id}
        productName={product.name}
      />
    </>
  );
}
