import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { DemoTryOn } from "@/components/demo-tryon";

export default async function DemoPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("key")
    .eq("brand_id", user.id)
    .eq("is_active", true)
    .limit(1);

  const apiKey = apiKeys?.[0]?.key || "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kitfit.app";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Try-On Demo</h1>
      <p className="text-sm text-slate-500 mb-6">
        Test the virtual try-on without embedding the widget on an external site.
      </p>
      <DemoTryOn apiKey={apiKey} appUrl={appUrl} />
    </div>
  );
}
