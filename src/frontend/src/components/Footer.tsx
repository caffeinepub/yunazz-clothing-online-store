import { Heart } from "lucide-react";
import { useAdminNavigation } from "../hooks/useAdminNavigation";

export default function Footer() {
  const { handleAdminClick } = useAdminNavigation();
  const appIdentifier = encodeURIComponent(
    window.location.hostname || "yunazz-clothing",
  );

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <a
              href="/admin"
              onClick={handleAdminClick}
              className="font-medium hover:text-primary transition-colors cursor-pointer"
            >
              Admin
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
