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

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_pairings")
    .select(
      `
      id,
      is_default,
      product:product_id (id, name, image_url, category),
      complement:complement_id (id, name, image_url, category)
    `
    )
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Pairings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pairings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ pairings: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, complementId, isDefault } = (await request.json()) as {
      productId: string;
      complementId: string;
      isDefault?: boolean;
    };

    if (!productId || !complementId) {
      return NextResponse.json(
        { error: "productId and complementId are required" },
        { status: 400 }
      );
    }

    if (productId === complementId) {
      return NextResponse.json(
        { error: "A product cannot be its own complement" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    if (isDefault) {
      await supabase
        .from("product_pairings")
        .update({ is_default: false })
        .eq("product_id", productId)
        .eq("brand_id", user.id);
    }

    const { data, error } = await supabase
      .from("product_pairings")
      .insert({
        brand_id: user.id,
        product_id: productId,
        complement_id: complementId,
        is_default: isDefault ?? false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This pairing already exists" },
          { status: 409 }
        );
      }
      console.error("Pairing insert error:", error);
      return NextResponse.json(
        { error: "Failed to create pairing" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pairingId = searchParams.get("id");

  if (!pairingId) {
    return NextResponse.json(
      { error: "Pairing ID is required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("product_pairings")
    .delete()
    .eq("id", pairingId)
    .eq("brand_id", user.id);

  if (error) {
    console.error("Pairing delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete pairing" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
