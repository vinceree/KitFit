import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmbedCodeDisplay } from "@/components/embed-code-display";

export default async function EmbedPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("*")
    .eq("brand_id", user.id)
    .eq("is_active", true)
    .limit(1);

  const apiKey = apiKeys?.[0]?.key || "YOUR_API_KEY";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kitfit.app";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Embed Code</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Widget Snippet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Paste this code on any product page where you want the try-on button
            to appear. The widget will automatically render a &ldquo;Try it on your
            bike&rdquo; button.
          </p>
          <EmbedCodeDisplay apiKey={apiKey} appUrl={appUrl} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                data-kitfit-key
              </code>
              <span className="text-slate-600 ml-2">
                Your API key (required)
              </span>
            </div>
            <div>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                data-kitfit-garment
              </code>
              <span className="text-slate-600 ml-2">
                URL of the product/jersey image (required)
              </span>
            </div>
            <div>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                data-kitfit-product
              </code>
              <span className="text-slate-600 ml-2">
                Product ID for analytics tracking (optional)
              </span>
            </div>
            <div>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                data-kitfit-button
              </code>
              <span className="text-slate-600 ml-2">
                Custom button text (optional, default: &ldquo;Try it on your bike
                &rarr;&rdquo;)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="bg-slate-100 px-3 py-2 rounded text-sm font-mono flex-1">
              {apiKey}
            </code>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Keep this key private. It identifies your brand and is used for
            billing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
