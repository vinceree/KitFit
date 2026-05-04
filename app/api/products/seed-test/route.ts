import { NextResponse } from "next/server";
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

interface TestProduct {
  slug: string;
  name: string;
  imageUrl: string;
  category: ProductCategory | null;
}

const STRAEDE_TEST_PRODUCTS: TestProduct[] = [
  { slug: "aerlig-jersey-men-motion", name: "Aerlig Jersey Men - Motion", imageUrl: "https://straede.cc/cdn/shop/files/AerligJerseyAeroRadtrikotHerrenMotionIceGrey_4.jpg?v=1772446398", category: "jersey" },
  { slug: "aerlig-jersey-women-motion", name: "Aerlig Jersey Women - Motion", imageUrl: "https://straede.cc/cdn/shop/files/AerligJerseyAeroRadtrikotDamenMotionIceGrey_2.jpg?v=1772446411", category: "jersey" },
  { slug: "aerlig-pro-jersey-men", name: "Aerlig Pro Jersey Men", imageUrl: "https://straede.cc/cdn/shop/files/Aerlig_Jersey_Pro_Performance_Radtrikot_Herren_Espresso_9.jpg?v=1770398544", category: "jersey" },
  { slug: "aerlig-pro-jersey-women", name: "Aerlig Pro Jersey Women", imageUrl: "https://straede.cc/cdn/shop/files/Aerlig_Jersey_Pro_Performance_Radtrikot_Damen_Solar_3.jpg?v=1770371086", category: "jersey" },
  { slug: "aero-bib-tight-men", name: "Aero Bib Tight Men", imageUrl: "https://straede.cc/cdn/shop/files/aero-bib-tight-herbal-grey-herren_4.jpg?v=1761293367", category: "bib_shorts" },
  { slug: "aero-pro-bib-shorts-men", name: "Aero Pro Bib Shorts Men", imageUrl: "https://straede.cc/cdn/shop/files/AeroProBibShortsPerformanceRadhoseHerrenEspresso_12.jpg?v=1770996238", category: "bib_shorts" },
  { slug: "aero-pro-bib-shorts-women", name: "Aero Pro Bib Shorts Women", imageUrl: "https://straede.cc/cdn/shop/files/Aero_Pro_Bib_Shorts_Performance_Radhose_Damen_Espresso_2_0979d5bb-d438-4ccc-91c9-484572fff4c8.jpg?v=1770396992", category: "bib_shorts" },
  { slug: "aexplore-longsleeve-men", name: "Aexplore Gravel Longsleeve Men", imageUrl: "https://straede.cc/cdn/shop/files/aexplore-gravel-longsleeve-lockere-passform-grey-grau-herren_3.jpg?v=1756301607", category: "longsleeve" },
  { slug: "baselayer-damen", name: "Baselayer Women", imageUrl: "https://straede.cc/cdn/shop/files/aero-bib-shorts-radhose-schwarz-damen_1_5b54d9e3-de21-46fb-aa44-9bf6f1644f51.jpg?v=1752990727", category: "baselayer" },
  { slug: "baselayer-herren", name: "Baselayer Men", imageUrl: "https://straede.cc/cdn/shop/files/aero-bib-shorts-radhose-schwarz-herren_11.jpg?v=1710169007", category: "baselayer" },
  { slug: "fahrradjacke-damen-winddicht-windbreaker-women", name: "Windbreaker Women", imageUrl: "https://straede.cc/cdn/shop/files/windbreaker-windjacke-rennrad-gravel-off-white-damen.jpg?v=1756330695", category: "jacket" },
  { slug: "fahrradjacke-herren-winter-aerlig-winter-jacket-men", name: "Aerlig Winter Jacket Men", imageUrl: "https://straede.cc/cdn/shop/files/aerlig-winter-jacket-black-schwarz-herren_4.jpg?v=1761219915", category: "jacket" },
  { slug: "farradweste-herren-vest-men", name: "Vest Men", imageUrl: "https://straede.cc/cdn/shop/files/vest-windweste-off-white-herren_2.jpg?v=1764060503", category: "vest" },
  { slug: "headband", name: "Headband", imageUrl: "https://straede.cc/cdn/shop/files/headband-stirnband-rennrad-gravel-schwarz_1.jpg?v=1758017317", category: "accessories" },
  { slug: "merino-baselayer-damen", name: "Merino Baselayer Women", imageUrl: "https://straede.cc/cdn/shop/files/merino-baselayer-langarm-rennrad-gravel-deep-olive_1_da6c1932-183f-4dda-975c-29ef10f3cd6d.jpg?v=1767618086", category: "baselayer" },
  { slug: "pro-sokks-rennrad-socken-mit-mehr-kompression", name: "Pro Sokks", imageUrl: "https://straede.cc/cdn/shop/files/pro-socks-radsocken-weiss_5.jpg?v=1755761568", category: "accessories" },
  { slug: "radtrikot-herren-langarm-aerlig-longsleeve-men", name: "Aerlig Longsleeve Men", imageUrl: "https://straede.cc/cdn/shop/files/aerlig-longsleeve-black-schwarz-herren_4.jpg?v=1756329119", category: "longsleeve" },
  { slug: "rennradhose-damen-mit-polster-aero-bib-shorts-women", name: "Aero Bib Shorts Women", imageUrl: "https://straede.cc/cdn/shop/files/Aero_Bib_Shorts_Fahrrad_Radhose_Damen_Cloud_9.jpg?v=1770374279", category: "bib_shorts" },
  { slug: "rennradhose-herren-mit-polster-aero-bib-shorts-men", name: "Aero Bib Shorts Men", imageUrl: "https://straede.cc/cdn/shop/files/AeroBibShortsFahrradRadhoseHerrenTarmac_2.jpg?v=1771609966", category: "bib_shorts" },
  { slug: "rennradtrikot-damen-aerlig-jersey-women", name: "Aerlig Jersey Women", imageUrl: "https://straede.cc/cdn/shop/files/Aerlig_Jersey_Aero_Radtrikot_Damen_Off_White_3.jpg?v=1770367892", category: "jersey" },
  { slug: "rennradtrikot-herren-aerlig-jersey-men", name: "Aerlig Jersey Men", imageUrl: "https://straede.cc/cdn/shop/files/Aerlig_Jersey_Aero_Radtrikot_Herren_Taupe_2.jpg?v=1770815725", category: "jersey" },
  { slug: "straede-geschenkgutschein", name: "Geschenkgutschein", imageUrl: "https://straede.cc/cdn/shop/files/straede-radbekleidung-geschenkgutschein-gift-card.jpg?v=1740756651", category: "other" },
];

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("products")
    .select("name")
    .eq("brand_id", user.id);

  const existingNames = new Set(
    (existing || []).map((p: { name: string }) => p.name)
  );

  const newProducts = STRAEDE_TEST_PRODUCTS.filter(
    (p) => !existingNames.has(p.name)
  );

  if (newProducts.length === 0) {
    return NextResponse.json({
      message: "All test products already imported",
      imported: 0,
    });
  }

  const rows = newProducts.map((p) => ({
    brand_id: user.id,
    name: p.name,
    image_url: p.imageUrl,
    product_url: `https://straede.cc/products/${p.slug}`,
    category: p.category,
  }));

  const { data: inserted, error } = await supabase
    .from("products")
    .insert(rows)
    .select();

  if (error) {
    console.error("Seed insert error:", error);
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Imported ${inserted.length} test products`,
    imported: inserted.length,
    products: inserted,
  });
}
