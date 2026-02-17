import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useGetAllProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const featuredProducts = products.filter((p) => p.isAvailable).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.jpg"
          alt="Yunazz Clothing Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative container h-full flex flex-col justify-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Discover Your Style with Yunazz
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Premium clothing collection for the modern wardrobe. Quality, comfort, and style in every piece.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our handpicked selection of premium clothing items
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products available yet</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/assets/generated/featured-collection.dim_800x300.jpg"
                alt="About Yunazz Clothing"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose Yunazz?</h2>
              <p className="text-lg text-muted-foreground">
                At Yunazz Clothing, we believe in delivering quality fashion that speaks to your unique style. Our carefully curated collection combines comfort, elegance, and affordability.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Premium quality fabrics and materials</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Wide range of sizes and styles</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Secure payment options including UPI, cards, and cash on delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Fast and reliable shipping</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
