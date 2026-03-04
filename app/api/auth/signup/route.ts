import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create Supabase auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // Create brand record
    await supabase.from("brands").insert({
      id: userId,
      name,
      email,
      plan_tier: "starter",
    });

    // Generate initial API key
    const apiKey = `kf_${uuid().replace(/-/g, "")}`;
    await supabase.from("api_keys").insert({
      brand_id: userId,
      key: apiKey,
    });

    // Sign in the user
    const { data: session, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      return NextResponse.json(
        { error: "Account created but could not sign in. Please log in." },
        { status: 201 }
      );
    }

    const response = NextResponse.json({ success: true }, { status: 201 });

    // Set auth cookie
    response.cookies.set("sb-access-token", session.session!.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("sb-refresh-token", session.session!.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
