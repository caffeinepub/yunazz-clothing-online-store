import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product, ProductSize, ProductType } from "../../backend";
import { ExternalBlob } from "../../backend";
import {
  useAddProduct,
  useUpdateProduct,
  useUpdateProductImages,
} from "../../hooks/useQueries";

function toProductType(kind: string): ProductType {
  switch (kind) {
    case "Shirt":
      return { __kind__: "Shirt", Shirt: null };
    case "Skirt":
      return { __kind__: "Skirt", Skirt: null };
    case "Pant":
      return { __kind__: "Pant", Pant: null };
    case "Suit":
      return { __kind__: "Suit", Suit: null };
    case "Shorts":
      return { __kind__: "Shorts", Shorts: null };
    case "Dress":
      return { __kind__: "Dress", Dress: null };
    case "Sweater":
      return { __kind__: "Sweater", Sweater: null };
    case "TShirt":
      return { __kind__: "TShirt", TShirt: null };
    case "Jacket":
      return { __kind__: "Jacket", Jacket: null };
    case "Blazer":
      return { __kind__: "Blazer", Blazer: null };
    case "Jeans":
      return { __kind__: "Jeans", Jeans: null };
    default:
      return { __kind__: "Other", Other: kind };
  }
}

function toProductSize(kind: string): ProductSize {
  switch (kind) {
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
      return { __kind__: "Custom", Custom: kind };
  }
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

const productTypes: { value: ProductType["__kind__"]; label: string }[] = [
  { value: "Shirt", label: "Shirt" },
  { value: "TShirt", label: "T-Shirt" },
  { value: "Pant", label: "Pant" },
  { value: "Jeans", label: "Jeans" },
  { value: "Dress", label: "Dress" },
  { value: "Jacket", label: "Jacket" },
  { value: "Sweater", label: "Sweater" },
  { value: "Blazer", label: "Blazer" },
  { value: "Shorts", label: "Shorts" },
  { value: "Skirt", label: "Skirt" },
  { value: "Suit", label: "Suit" },
];

const allSizes: { value: ProductSize["__kind__"]; label: string }[] = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

function extractErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return "An error occurred";
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const updateProductImages = useUpdateProductImages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockCount, setStockCount] = useState("");
  const [productType, setProductType] = useState<string>("Shirt");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M"]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(Number(product.price).toString());
      setStockCount(Number(product.stockCount).toString());
      setProductType(
        "Other" in product.productType
          ? (product.productType.Other ?? "Shirt")
          : product.productType.__kind__,
      );
      setSelectedSizes(
        product.sizes.map((s) => ("Custom" in s ? "M" : s.__kind__)),
      );
      setIsAvailable(product.isAvailable);
      setImages(product.images);
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStockCount("");
    setProductType("Shirt");
    setSelectedSizes(["M"]);
    setIsAvailable(true);
    setImages([]);
    setUploadProgress({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const newImages: ExternalBlob[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageIndex = images.length + i;
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
          (percentage) => {
            setUploadProgress((prev) => ({
              ...prev,
              [imageIndex]: percentage,
            }));
          },
        );
        newImages.push(blob);
      }
      setImages([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
      setUploadProgress({});
    } catch (error: any) {
      toast.error(`Failed to upload images: ${extractErrorMessage(error)}`);
      console.error("Image upload error:", error);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const clearAllImages = () => {
    setImages([]);
    setUploadProgress({});
    toast.success("All images cleared");
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !stockCount ||
      selectedSizes.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const productData: Product = {
      id:
        product?.id ||
        `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      price: BigInt(Math.round(Number.parseFloat(price))),
      stockCount: BigInt(Number.parseInt(stockCount)),
      productType: toProductType(productType),
      sizes: selectedSizes.map(toProductSize),
      isAvailable,
      images,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated successfully");
      } else {
        await addProduct.mutateAsync(productData);
        toast.success("Product added successfully");
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      toast.error(
        product
          ? `Failed to update product: ${errorMessage}`
          : `Failed to add product: ${errorMessage}`,
      );
      console.error("Product save error:", error);
    }
  };

  const isSubmitting =
    addProduct.isPending ||
    updateProduct.isPending ||
    updateProductImages.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              data-ocid="product.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              data-ocid="product.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock Count <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Product Type <span className="text-destructive">*</span>
            </Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger data-ocid="product.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Available Sizes <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => (
                <Button
                  key={size.value}
                  type="button"
                  variant={
                    selectedSizes.includes(size.value) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleSize(size.value)}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              data-ocid="product.checkbox"
              checked={isAvailable}
              onCheckedChange={(checked) => setIsAvailable(checked as boolean)}
            />
            <Label htmlFor="available" className="cursor-pointer">
              Available for purchase
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Product Images</Label>
              {images.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllImages}
                  disabled={uploadingImages}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div
                  key={image.getDirectURL() || `fallback-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={image.getDirectURL()}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {uploadProgress[index] !== undefined &&
                    uploadProgress[index] < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-xs">
                          {uploadProgress[index]}%
                        </div>
                      </div>
                    )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <label
                data-ocid="product.upload_button"
                className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
                {uploadingImages ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </label>
            </div>
            {images.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No images uploaded. Click the upload button to add product
                images.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              data-ocid="product.submit_button"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {product ? "Updating..." : "Adding..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="product.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
