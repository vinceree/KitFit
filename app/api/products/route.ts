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

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const productUrl = formData.get("product_url") as string;
    const image = formData.get("image") as File;

    if (!name || !image) {
      return NextResponse.json(
        { error: "Name and image are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Upload image to Supabase Storage
    const ext = image.name.split(".").pop() || "jpg";
    const fileName = `products/${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: image.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    // Create product record
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        brand_id: user.id,
        name,
        image_url: publicUrl,
        product_url: productUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
