import { useState, useEffect } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertTriangle, Info, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../../backend';

export default function StripeSetup() {
  const { actor } = useActor();
  const { data: isConfigured = false, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('IN');
  const [currentConfig, setCurrentConfig] = useState<StripeConfiguration | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    const loadCurrentConfig = async () => {
      if (actor && isConfigured) {
        setLoadingConfig(true);
        try {
          const config = await actor.getStripeConfiguration();
          setCurrentConfig(config);
          setCountries(config.allowedCountries.join(','));
        } catch (error) {
          console.error('Error loading Stripe config:', error);
        } finally {
          setLoadingConfig(false);
        }
      }
    };

    loadCurrentConfig();
  }, [actor, isConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const countryList = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryList.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      });
      toast.success('Stripe configuration updated successfully');
      setSecretKey('');
      
      // Reload current config
      if (actor) {
        const config = await actor.getStripeConfiguration();
        setCurrentConfig(config);
      }
    } catch (error) {
      toast.error('Failed to save Stripe configuration');
      console.error(error);
    }
  };

  const isTestKey = currentConfig?.secretKey.startsWith('sk_test');

  if (isLoading || loadingConfig) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      {isConfigured && currentConfig && (
        <Alert className={isTestKey ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'}>
          {isTestKey ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertTitle>
            {isTestKey ? 'Test Mode Active' : 'Stripe Configured'}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {isTestKey
                ? 'Stripe is configured in test mode. All card payments will be processed as test transactions.'
                : 'Stripe is configured and ready to accept live card payments.'}
            </p>
            <div className="text-sm space-y-1 mt-2">
              <p>
                <strong>API Key:</strong> {currentConfig.secretKey.substring(0, 12)}...
                {isTestKey && <span className="ml-2 text-amber-600 font-semibold">(TEST KEY)</span>}
              </p>
              <p>
                <strong>Allowed Countries:</strong> {currentConfig.allowedCountries.join(', ')}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isConfigured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Stripe payment integration is not yet configured. Configure it below to enable credit/debit card payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isConfigured ? 'Update Stripe Configuration' : 'Configure Stripe Payment'}
          </CardTitle>
          <CardDescription>
            {isConfigured
              ? 'Update your Stripe API key or allowed countries'
              : 'Set up Stripe to accept credit and debit card payments'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">
                Stripe Secret Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={isConfigured ? 'Enter new key to update' : 'sk_test_... or sk_live_...'}
                required
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Get your secret key from the{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    Stripe Dashboard
                  </a>
                </p>
                <p className="text-amber-600 dark:text-amber-500">
                  • Use <strong>sk_test_...</strong> keys for testing
                </p>
                <p className="text-green-600 dark:text-green-500">
                  • Use <strong>sk_live_...</strong> keys for production
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">
                Allowed Countries <span className="text-destructive">*</span>
              </Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="IN,US,GB,CA"
                required
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of 2-letter ISO country codes (e.g., IN, US, GB, CA)
              </p>
            </div>

            <Button type="submit" disabled={setStripeConfig.isPending}>
              {setStripeConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConfigured ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Methods Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Payment Methods</CardTitle>
          <CardDescription>All payment options available to your customers at checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">UPI Payments</p>
                <p className="text-sm text-muted-foreground">Always available - Google Pay, PhonePe, Paytm, and other UPI apps</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              {isConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0 mt-0.5" />
              )}
              <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  Credit/Debit Cards via Stripe
                  {isConfigured && isTestKey && (
                    <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                      TEST MODE
                    </span>
                  )}
                  {isConfigured && !isTestKey && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                      LIVE
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured
                    ? isTestKey
                      ? 'Active in test mode - use test card numbers for testing'
                      : 'Active and ready for live payments'
                    : 'Not configured - set up Stripe above to enable card payments'}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <Banknote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Always available - pay in cash when you receive your order</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Test Mode Information */}
      {isConfigured && isTestKey && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Test Mode Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Your Stripe integration is currently in test mode. This means:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>No real money will be charged for card payments</li>
              <li>Use Stripe test card numbers (e.g., 4242 4242 4242 4242)</li>
              <li>Transactions appear in your Stripe test dashboard</li>
              <li>Perfect for testing your checkout flow</li>
              <li>UPI and Cash on Delivery work normally</li>
            </ul>
            <p className="text-amber-700 dark:text-amber-400 font-medium mt-3">
              When ready for production, update the configuration above with your live API key (sk_live_...).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
