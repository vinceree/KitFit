import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  if (!jobId || jobId.length < 10) {
    return json({ error: "Invalid job ID" }, 400);
  }

  const supabase = createServiceClient();

  // Check if the result image exists in storage (no DB migration required).
  const { error: resultError } = await supabase.storage
    .from("tryon-temp")
    .createSignedUrl(`results/${jobId}.jpg`, 60);

  if (!resultError) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("tryon-temp").getPublicUrl(`results/${jobId}.jpg`);
    return json({ status: "completed", resultImage: publicUrl });
  }

  // Check if the generation failed (error marker uploaded by the route).
  const { data: errorBlob, error: dlError } = await supabase.storage
    .from("tryon-temp")
    .download(`results/${jobId}.error`);

  if (!dlError && errorBlob) {
    const errorText = await errorBlob.text();
    return json({ status: "failed", error: errorText });
  }

  return json({ status: "processing" });
}
