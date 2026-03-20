import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Share2, User, X } from "lucide-react";
import { useState } from "react";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { handleAdminClick } = useAdminNavigation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
    setMobileMenuOpen(false);
  };

  const handleAdminClickWithMenu = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    handleAdminClick(e);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/assets/generated/yunazz-logo-transparent.dim_200x200.png"
            alt="Yunazz Clothing"
            className="h-10 w-10"
          />
          <span className="text-xl font-bold tracking-tight">
            Yunazz Clothing
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Orders
            </Link>
          )}
          <Link
            to="/share"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Share Store
          </Link>
          <a
            href="/admin"
            onClick={handleAdminClick}
            className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
          >
            Admin
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            className="hidden md:flex"
          >
            <User className="mr-2 h-4 w-4" />
            {disabled ? "Loading..." : isAuthenticated ? "Logout" : "Login"}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container flex flex-col space-y-4 py-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            <Link
              to="/share"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Store
            </Link>
            <a
              href="/admin"
              onClick={handleAdminClickWithMenu}
              className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
            >
              Admin
            </a>
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              {disabled ? "Loading..." : isAuthenticated ? "Logout" : "Login"}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
