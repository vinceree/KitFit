import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";

export async function getSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) return null;

  return data.user;
}

export async function getBrand() {
  const user = await getSession();
  if (!user) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
