import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

const STORE_URL = "https://yunazz-clothing-online-store-iug.caffeine.xyz/";

export default function ShareStorePage() {
  const copyLink = (message?: string) => {
    navigator.clipboard
      .writeText(STORE_URL)
      .then(() => toast.success(message ?? "Link copied!"))
      .catch(() => toast.error("Could not copy link"));
  };

  const shareButtons = [
    {
      label: "Share on WhatsApp",
      icon: <SiWhatsapp size={22} />,
      className: "bg-[#25D366] hover:bg-[#1ebe5d] text-white",
      action: () => {
        const text = encodeURIComponent(
          `Check out Yunazz Clothing! Shop beautiful Indian fashion: ${STORE_URL}`,
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
    },
    {
      label: "Share on Instagram",
      icon: <SiInstagram size={22} />,
      className:
        "bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 text-white",
      action: () => copyLink("Link copied! Paste it on Instagram"),
    },
    {
      label: "Share on Facebook",
      icon: <SiFacebook size={22} />,
      className: "bg-[#1877F2] hover:bg-[#1467d8] text-white",
      action: () => {
        const url = encodeURIComponent(STORE_URL);
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          "_blank",
        );
      },
    },
    {
      label: "Copy Link",
      icon: <Copy size={22} />,
      className:
        "bg-secondary hover:bg-secondary/80 text-foreground border border-border",
      action: () => copyLink("Link copied!"),
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="container max-w-lg py-12 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Share Yunazz Clothing
          </h1>
          <p className="text-muted-foreground text-base">
            Share with your friends easily!
          </p>
        </motion.div>

        {/* Store URL display */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 mb-8 shadow-sm"
        >
          <span className="flex-1 text-sm text-muted-foreground truncate font-mono">
            {STORE_URL}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyLink()}
            className="shrink-0"
            data-ocid="share.copy.button"
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col gap-3 mb-10"
        >
          {shareButtons.map((btn, i) => (
            <motion.div
              key={btn.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
            >
              <button
                type="button"
                onClick={btn.action}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-base transition-all shadow-sm active:scale-95 ${btn.className}`}
                data-ocid={`share.${btn.label.toLowerCase().replace(/\s+/g, "_")}.button`}
              >
                {btn.icon}
                {btn.label}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm"
        >
          <h2 className="font-display text-lg font-bold mb-1">QR Code</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Show your friends — they can scan it with their phone camera
          </p>
          <div className="flex justify-center">
            <img
              src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(STORE_URL)}`}
              alt="QR Code for Yunazz Clothing"
              className="rounded-lg border border-border"
              width={200}
              height={200}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            📱 Open your phone camera → Point at the QR code → Tap the link
          </p>
        </motion.div>

        {/* Instructions */}
        <div
          className="mt-8 bg-secondary/40 rounded-xl p-4 text-sm text-muted-foreground text-center"
          data-ocid="share.panel"
        >
          Send to friends on WhatsApp or Instagram, or show them the QR code to
          scan
        </div>
      </section>
    </main>
  );
}
