import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const destinations: Record<string,string> = {
  invite: "/auth/invite",
  magiclink: "/auth/existing-invite",
  recovery: "/reset-password?mode=update",
};

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (!tokenHash || !type || !(type in destinations)) {
    return NextResponse.redirect(new URL("/login?error=Tautan+tidak+valid",request.url));
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
  if (error) return NextResponse.redirect(new URL("/login?error=Tautan+kedaluwarsa+atau+sudah+dipakai",request.url));
  return NextResponse.redirect(new URL(destinations[type],request.url));
}
