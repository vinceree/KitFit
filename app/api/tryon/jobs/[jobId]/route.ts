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

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  if (!jobId || jobId.length < 10) {
    return NextResponse.json(
      { error: "Invalid job ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("try_ons")
    .select("status, result_image_url, error_message")
    .eq("job_id", jobId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { status: "pending" },
      { headers: corsHeaders }
    );
  }

  const response: Record<string, unknown> = { status: data.status };

  if (data.status === "completed" && data.result_image_url) {
    response.resultImage = data.result_image_url;
  }

  if (data.status === "failed") {
    response.error = data.error_message || "Generation failed";
  }

  return NextResponse.json(response, { headers: corsHeaders });
}
