import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";

async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  const supabase = createServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verify product belongs to this brand
  const { data: product } = await supabase
    .from("products")
    .select("id, brand_id")
    .eq("id", params.id)
    .single();

  if (!product || product.brand_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.from("products").delete().eq("id", params.id);

  return NextResponse.json({ success: true });
}
