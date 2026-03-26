import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { Menu, Share2, ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Header() {
  const { items } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1" data-ocid="nav.link">
          <span
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontWeight: 700,
              fontSize: "1.35rem",
              letterSpacing: "-0.01em",
              color: "#1a1a1a",
            }}
          >
            Yunazz
          </span>
          <span
            style={{
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#c2185b",
              marginLeft: 4,
            }}
          >
            Clothing
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.home.link"
          >
            Home
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.shop.link"
          >
            Shop
          </Link>
          <Link
            to="/orders"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.orders.link"
          >
            My Orders
          </Link>
          <Link
            to="/share"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            data-ocid="nav.share.link"
          >
            <Share2 className="h-4 w-4" />
            Share Store
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.admin.link"
          >
            Admin
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <CartButton cartCount={cartCount} />

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-ocid="nav.account.button"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              data-ocid="nav.account.dropdown_menu"
            >
              {identity ? (
                <>
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {identity.getPrincipal().toString().slice(0, 12)}...
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={clear}
                    data-ocid="nav.logout.button"
                  >
                    Log Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                  data-ocid="nav.login.button"
                >
                  {loginStatus === "logging-in"
                    ? "Logging in..."
                    : "Admin Login"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-ocid="nav.mobile_menu.button"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64"
              data-ocid="nav.mobile_menu.sheet"
            >
              <nav className="flex flex-col gap-4 mt-6">
                <Link
                  to="/"
                  className="text-base font-medium"
                  data-ocid="nav.mobile.home.link"
                >
                  Home
                </Link>
                <Link
                  to="/"
                  className="text-base font-medium"
                  data-ocid="nav.mobile.shop.link"
                >
                  Shop
                </Link>
                <Link
                  to="/orders"
                  className="text-base font-medium"
                  data-ocid="nav.mobile.orders.link"
                >
                  My Orders
                </Link>
                <Link
                  to="/share"
                  className="text-base font-medium text-primary flex items-center gap-1"
                  data-ocid="nav.mobile.share.link"
                >
                  <Share2 className="h-4 w-4" /> Share Store
                </Link>
                <Link
                  to="/admin"
                  className="text-base font-medium"
                  data-ocid="nav.mobile.admin.link"
                >
                  Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function CartButton({ cartCount }: { cartCount: number }) {
  const { openCart } = useCart();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCart}
      data-ocid="cart.open_modal_button"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
          {cartCount}
        </Badge>
      )}
    </Button>
  );
}
