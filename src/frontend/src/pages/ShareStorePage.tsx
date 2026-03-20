import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareStorePage() {
  const [copied, setCopied] = useState(false);

  // Generate clean storefront URL (origin + "/" without any hash/fragment)
  const storeUrl = `${window.location.origin}/`;

  // Use a public QR code API service to generate the QR code image
  // Using QR Server API which is free and doesn't require authentication
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadQR = async () => {
    try {
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch QR code");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = "yunazz-store-qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
      toast.success("QR code downloaded!");
    } catch (_error) {
      console.error("Download error:", _error);
      toast.error("Failed to download QR code");
    }
  };

  const handleOpenQRInNewTab = () => {
    window.open(qrCodeUrl, "_blank");
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Share2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Share Your Store
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your Yunazz Clothing store with friends and customers
          </p>
        </div>

        <div className="space-y-6">
          {/* Store Link Card */}
          <Card>
            <CardHeader>
              <CardTitle>Store Link</CardTitle>
              <CardDescription>
                Copy this link to share your store on social media, messaging
                apps, or anywhere else
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={storeUrl}
                  readOnly
                  className="font-mono text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="shrink-0"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Scan this QR code with a phone camera to visit your store
                instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center rounded-lg border border-border bg-white p-8">
                <img
                  src={qrCodeUrl}
                  alt="Store QR Code"
                  className="h-[300px] w-[300px]"
                  loading="lazy"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadQR}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
                <Button
                  onClick={handleOpenQRInNewTab}
                  variant="outline"
                  size="icon"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Sharing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Share the link on WhatsApp, Instagram, Facebook, or any
                    messaging app
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Print the QR code and display it in your physical store or
                    on flyers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Add the QR code to your business cards or promotional
                    materials
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Post the link in your Instagram bio or other social media
                    profiles
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
