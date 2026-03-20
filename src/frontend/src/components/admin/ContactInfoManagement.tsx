import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import { useGetContactInfo, useSetContactInfo } from "../../hooks/useQueries";

export default function ContactInfoManagement() {
  const { data: contactInfo, isLoading } = useGetContactInfo();
  const setContactInfo = useSetContactInfo();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [qrImage, setQrImage] = useState<ExternalBlob | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    if (contactInfo) {
      setPhone(contactInfo.phone);
      setEmail(contactInfo.email);
      setInstagram(contactInfo.instagram);
      setQrImage(contactInfo.instagramQr);
    }
  }, [contactInfo]);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      setQrImage(blob);
      toast.success("QR code uploaded");
    } catch (error) {
      toast.error("Failed to upload QR code");
      console.error(error);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !email.trim() || !instagram.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await setContactInfo.mutateAsync({
        phone: phone.trim(),
        email: email.trim(),
        instagram: instagram.trim(),
        instagramQr: qrImage || ExternalBlob.fromBytes(new Uint8Array()),
      });
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact information");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Manage your store's contact details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">
              Instagram Handle <span className="text-destructive">*</span>
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yunazzclotheshub"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Instagram QR Code</Label>
            <div className="flex items-center gap-4">
              {qrImage && (
                <img
                  src={qrImage.getDirectURL()}
                  alt="Instagram QR"
                  className="w-32 h-32 rounded-lg border object-cover"
                />
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                  disabled={uploadingQr}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingQr}
                  asChild
                >
                  <span>
                    {uploadingQr ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload QR Code
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={setContactInfo.isPending}>
            {setContactInfo.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
