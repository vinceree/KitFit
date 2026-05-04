import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";
import type { ProductCategory } from "@/lib/supabase/types";

async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  const supabase = createServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

interface ScrapedProduct {
  name: string;
  imageUrl: string;
  productUrl: string;
  category: ProductCategory | null;
}

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  jersey: ["jersey", "trikot", "radtrikot"],
  bib_shorts: ["bib short", "bib tight", "radhose", "rennradhose"],
  jacket: ["jacket", "jacke", "fahrradjacke"],
  vest: ["vest", "weste", "fahrradweste"],
  baselayer: ["baselayer", "base layer"],
  longsleeve: ["longsleeve", "long sleeve", "langarm"],
  accessories: [
    "sock",
    "headband",
    "glove",
    "cap",
    "sokk",
    "socken",
    "handschuh",
  ],
  other: [],
};

function guessCategory(name: string): ProductCategory | null {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === "other") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat as ProductCategory;
    }
  }
  return null;
}

async function scrapeProductPage(url: string): Promise<ScrapedProduct | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "KitFit-Import/1.0" },
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const ogTitle = extractMeta(html, "og:title");
    const ogImage = extractMeta(html, "og:image");
    const ogUrl = extractMeta(html, "og:url");

    if (!ogTitle || !ogImage) return null;

    let imageUrl = ogImage;
    if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;

    return {
      name: ogTitle,
      imageUrl,
      productUrl: ogUrl || url,
      category: guessCategory(ogTitle),
    };
  } catch {
    return null;
  }
}

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    "i"
  );
  const altMatch = html.match(altRegex);
  return altMatch ? altMatch[1] : null;
}

async function discoverProductLinks(
  siteUrl: string
): Promise<string[]> {
  try {
    const resp = await fetch(siteUrl, {
      headers: { "User-Agent": "KitFit-Import/1.0" },
    });
    if (!resp.ok) return [];
    const html = await resp.text();

    const base = new URL(siteUrl);
    const links: Record<string, true> = {};
    const regex = /href=["']([^"']*\/products\/[^"'#?]+)/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      let href = match[1];
      if (href.startsWith("/")) href = base.origin + href;
      else if (!href.startsWith("http")) href = base.origin + "/" + href;
      const clean = href.split("?")[0].split("#")[0];
      links[clean] = true;
    }
    return Object.keys(links);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, products: manualProducts } = body as {
      url?: string;
      products?: Array<{
        name: string;
        imageUrl: string;
        productUrl?: string;
        category?: ProductCategory;
      }>;
    };

    const supabase = createServiceClient();
    let imported: ScrapedProduct[] = [];

    if (url) {
      const productLinks = await discoverProductLinks(url);
      if (productLinks.length === 0) {
        return NextResponse.json(
          { error: "No product pages found at that URL" },
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        productLinks.map((link) => scrapeProductPage(link))
      );
      imported = results
        .filter(
          (r): r is PromiseFulfilledResult<ScrapedProduct> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);
    } else if (manualProducts && manualProducts.length > 0) {
      imported = manualProducts.map((p) => ({
        name: p.name,
        imageUrl: p.imageUrl,
        productUrl: p.productUrl || "",
        category: p.category || guessCategory(p.name),
      }));
    } else {
      return NextResponse.json(
        { error: "Provide a store URL or product list" },
        { status: 400 }
      );
    }

    if (imported.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any products from that URL" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("products")
      .select("name")
      .eq("brand_id", user.id);

    const existingNames = new Set(
      (existing || []).map((p: { name: string }) => p.name)
    );
    const newProducts = imported.filter((p) => !existingNames.has(p.name));

    if (newProducts.length === 0) {
      return NextResponse.json({
        message: "All products already imported",
        imported: 0,
        total: imported.length,
      });
    }

    const rows = newProducts.map((p) => ({
      brand_id: user.id,
      name: p.name,
      image_url: p.imageUrl,
      product_url: p.productUrl || null,
      category: p.category,
    }));

    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(rows)
      .select();

    if (insertError) {
      console.error("Product import insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Imported ${insertedProducts.length} products`,
      imported: insertedProducts.length,
      skipped: imported.length - newProducts.length,
      products: insertedProducts,
    });
  } catch (err) {
    console.error("Product import error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
