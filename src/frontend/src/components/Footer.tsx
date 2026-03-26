import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";
  return (
    <footer className="bg-foreground text-primary-foreground mt-auto">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">
            Yunazz Clothing
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Your favourite Indian fashion destination. Stylish, affordable, and
            delivered to your door.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/orders"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Track My Order
            </Link>
            <Link
              to="/admin"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-3">Contact Us</h4>
          <div className="flex flex-col gap-2">
            <a
              href="tel:8904107520"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Phone className="h-4 w-4" />
              8904107520
            </a>
            <a
              href="mailto:ymd72675@gmail.com"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Mail className="h-4 w-4" />
              ymd72675@gmail.com
            </a>
            <a
              href="https://instagram.com/yunazzclotheshub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @yunazzclotheshub
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs">
          <span>© {year} Yunazz Clothing. All rights reserved.</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
