import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Key,
  Loader2,
  PartyPopper,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StripeConfiguration } from "../../backend";
import { useActor } from "../../hooks/useActor";
import {
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../../hooks/useQueries";

export default function StripeSetup() {
  const { actor } = useActor();
  const { data: isConfigured = false, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN");
  const [currentConfig, setCurrentConfig] =
    useState<StripeConfiguration | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const loadCurrentConfig = async () => {
      if (actor && isConfigured) {
        setLoadingConfig(true);
        try {
          const config = await actor.getStripeConfiguration();
          setCurrentConfig(config);
          setCountries(config.allowedCountries.join(","));
        } catch (error) {
          console.error("Error loading Stripe config:", error);
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
      toast.error("Please enter your Stripe secret key");
      return;
    }

    const countryList = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryList.length === 0) {
      toast.error("Please enter at least one valid country code");
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      });
      toast.success("Stripe configuration updated successfully");
      setSecretKey("");
      setJustSaved(true);

      if (actor) {
        const config = await actor.getStripeConfiguration();
        setCurrentConfig(config);
      }
    } catch (error) {
      toast.error("Failed to save Stripe configuration");
      console.error(error);
    }
  };

  const isTestKey = currentConfig?.secretKey.startsWith("sk_test");

  if (isLoading || loadingConfig) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 🎉 Big success banner after saving */}
      {justSaved && (
        <div
          data-ocid="stripe.success_state"
          className="rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-6 flex flex-col items-center text-center gap-3"
        >
          <PartyPopper className="h-12 w-12 text-green-600" />
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
            Stripe is Ready! 🎉
          </h2>
          <p className="text-green-700 dark:text-green-300 text-base">
            Your customers can now pay by <strong>Card</strong> and{" "}
            <strong>UPI</strong> at checkout.
          </p>
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-100 mt-1"
            onClick={() => setJustSaved(false)}
            data-ocid="stripe.close_button"
          >
            Got it!
          </Button>
        </div>
      )}

      {/* Current Status Banner */}
      {isConfigured && currentConfig && !justSaved && (
        <Alert
          className={
            isTestKey
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
              : "border-green-500 bg-green-50 dark:bg-green-950/20"
          }
        >
          {isTestKey ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertTitle className="font-bold">
            {isTestKey ? "⚠️ Test Mode Active" : "✅ Stripe is Working!"}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {isTestKey
                ? "You are in test mode. No real money is being charged. Switch to a live key when ready."
                : "Stripe is set up and your customers can pay by card and UPI right now."}
            </p>
            <p className="text-sm">
              <strong>Key in use:</strong>{" "}
              {currentConfig.secretKey.substring(0, 12)}...
              {isTestKey ? " (TEST)" : " (LIVE)"}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* STEP 1 — Create Account */}
      {!isConfigured && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-lg font-bold flex-shrink-0">
                1
              </span>
              <div>
                <CardTitle className="text-lg">
                  Create Your Stripe Account (Free)
                </CardTitle>
                <CardDescription>
                  You need a Stripe account to accept online payments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href="https://dashboard.stripe.com/register"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="stripe.open_modal_button"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-semibold gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Create Free Stripe Account
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Already have an account?{" "}
              <a
                href="https://dashboard.stripe.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Log in here
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Visual flow arrow — only for first-time setup */}
      {!isConfigured && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground px-2">
          {[
            { icon: UserPlus, label: "Create Account" },
            { icon: Key, label: "Get API Key" },
            { icon: CreditCard, label: "Paste Here" },
            { icon: CheckCircle, label: "Done!" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mb-4" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 — Get Key (only for first-time) */}
      {!isConfigured && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-lg font-bold flex-shrink-0">
                2
              </span>
              <div>
                <CardTitle className="text-lg">
                  Copy Your Secret Key from Stripe
                </CardTitle>
                <CardDescription>
                  You need to get your key from the Stripe website
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">→ Log in to your Stripe account</li>
              <li className="flex gap-2">
                → Go to <strong>Developers → API Keys</strong>
              </li>
              <li className="flex gap-2">
                → Click <strong>"Reveal"</strong> next to the Secret Key
              </li>
              <li className="flex gap-2">
                → Copy it (starts with{" "}
                <code className="bg-muted px-1 rounded">sk_test_</code> or{" "}
                <code className="bg-muted px-1 rounded">sk_live_</code>)
              </li>
            </ol>
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary underline font-medium"
            >
              Open Stripe API Keys page <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 / Main Setup Card — Paste Key */}
      <Card className="border-2 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            {!isConfigured && (
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-lg font-bold flex-shrink-0">
                3
              </span>
            )}
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                {isConfigured
                  ? "Update Your Stripe Key"
                  : "Paste Your Stripe Key Here"}
              </CardTitle>
              <CardDescription>
                {isConfigured
                  ? "Enter a new key below to update your Stripe settings."
                  : "Paste the key you copied from Stripe and click Save."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-base font-semibold">
                Your Stripe Secret Key{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={
                  isConfigured
                    ? "Enter new key to update (sk_test_... or sk_live_...)"
                    : "Paste your key here (sk_test_... or sk_live_...)"
                }
                className="h-14 text-base"
                required
                data-ocid="stripe.input"
              />
              <div className="rounded-lg bg-muted/60 border p-3 space-y-1 text-sm">
                <p className="font-semibold text-foreground">
                  What key should I use?
                </p>
                <p className="text-amber-600 dark:text-amber-400">
                  🔶 <strong>sk_test_...</strong> = Testing mode (no real money
                  charged — use this first)
                </p>
                <p className="text-green-600 dark:text-green-400">
                  ✅ <strong>sk_live_...</strong> = Real money mode (use this
                  when you are ready)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries" className="text-base font-semibold">
                Your Country Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="IN"
                className="h-11 max-w-xs text-base"
                required
                data-ocid="stripe.select"
              />
              <p className="text-sm text-muted-foreground">
                For India, keep it as <strong>IN</strong>. For multiple
                countries: IN,US,GB
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-bold py-6"
              disabled={setStripeConfig.isPending}
              data-ocid="stripe.submit_button"
            >
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isConfigured
                    ? "Update Stripe Key"
                    : "Save & Activate Card Payments"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Methods Overview */}
      <Card>
        <CardHeader>
          <CardTitle>How Customers Can Pay</CardTitle>
          <CardDescription>
            All payment options available at checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 rounded-xl border bg-card">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">UPI Payments</p>
                <p className="text-sm text-muted-foreground">
                  Always active — Google Pay, PhonePe, Paytm, and all UPI apps
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl border bg-card">
              {isConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0 mt-0.5" />
              )}
              <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">
                  Credit / Debit Cards via Stripe
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
                      ? "Active in test mode. Test card: 4242 4242 4242 4242"
                      : "Active and accepting real payments"
                    : "Set up Stripe above to enable this"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl border bg-card">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <Banknote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Cash on Delivery (COD)</p>
                <p className="text-sm text-muted-foreground">
                  Always active — customer pays cash when the parcel arrives
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Test Mode Info */}
      {isConfigured && isTestKey && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              You are in Test Mode — No Real Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Your Stripe is in <strong>test mode</strong>. This means:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>No real money is charged to anyone</li>
              <li>
                Test card: <strong>4242 4242 4242 4242</strong>, any future
                date, any 3 digits for CVV
              </li>
              <li>Test transactions appear in your Stripe test dashboard</li>
              <li>UPI and COD still work normally</li>
            </ul>
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              When ready for real payments, paste your{" "}
              <strong>sk_live_...</strong> key above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
