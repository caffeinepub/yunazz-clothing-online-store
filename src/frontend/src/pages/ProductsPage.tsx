import { useState } from 'react';
import { useGetFilteredProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, ShoppingBag } from 'lucide-react';
import type { ProductFilter, ProductType, ProductSize } from '../backend';

const productTypes: { value: ProductType['__kind__']; label: string }[] = [
  { value: 'Shirt', label: 'Shirts' },
  { value: 'TShirt', label: 'T-Shirts' },
  { value: 'Pant', label: 'Pants' },
  { value: 'Jeans', label: 'Jeans' },
  { value: 'Dress', label: 'Dresses' },
  { value: 'Jacket', label: 'Jackets' },
  { value: 'Sweater', label: 'Sweaters' },
  { value: 'Blazer', label: 'Blazers' },
  { value: 'Shorts', label: 'Shorts' },
  { value: 'Skirt', label: 'Skirts' },
  { value: 'Suit', label: 'Suits' },
];

const sizes: { value: ProductSize['__kind__']; label: string }[] = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

export default function ProductsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number]>([10000]);

  const filter: ProductFilter = {
    searchText: searchText || undefined,
    productType: selectedType ? ({ __kind__: selectedType } as ProductType) : undefined,
    size: selectedSize ? ({ __kind__: selectedSize } as ProductSize) : undefined,
    maxPrice: BigInt(priceRange[0]),
    isAvailable: true,
  };

  const { data: products = [], isLoading } = useGetFilteredProducts(filter);

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {productTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Size</Label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger>
            <SelectValue placeholder="All Sizes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sizes</SelectItem>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Max Price: ₹{priceRange[0]}</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number])}
          max={10000}
          min={100}
          step={100}
          className="mt-2"
        />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSearchText('');
          setSelectedType('');
          setSelectedSize('');
          setPriceRange([10000]);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Our Collection</h1>
        <p className="text-muted-foreground">Browse our complete range of premium clothing</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-card rounded-lg border p-6">
            <h2 className="font-semibold mb-4 flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filters */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${products.length} products found`}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchText('');
                  setSelectedType('');
                  setSelectedSize('');
                  setPriceRange([10000]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
