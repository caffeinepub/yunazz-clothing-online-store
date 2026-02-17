import { useGetContactInfo } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import { SiInstagram } from 'react-icons/si';

export default function ContactPage() {
  const { data: contactInfo, isLoading } = useGetContactInfo();

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="max-w-4xl mx-auto animate-pulse space-y-8">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`tel:${contactInfo?.phone}`} className="text-lg hover:text-primary transition-colors">
                {contactInfo?.phone || '8904107520'}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`mailto:${contactInfo?.email}`} className="text-lg hover:text-primary transition-colors">
                {contactInfo?.email || 'ymd72675@gmail.com'}
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SiInstagram className="mr-2 h-5 w-5 text-primary" />
              Follow Us on Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                {contactInfo?.instagramQr ? (
                  <img
                    src={contactInfo.instagramQr.getDirectURL()}
                    alt="Instagram QR Code"
                    className="w-48 h-48 rounded-lg border"
                  />
                ) : (
                  <img
                    src="/assets/IMG_0440.png"
                    alt="Instagram QR Code"
                    className="w-48 h-48 rounded-lg border object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg mb-4">Scan the QR code or click below to follow us</p>
                <a
                  href={`https://instagram.com/${(contactInfo?.instagram || '@yunazzclotheshub').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xl font-semibold text-primary hover:underline"
                >
                  <SiInstagram className="mr-2 h-6 w-6" />
                  {contactInfo?.instagram || '@yunazzclotheshub'}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
