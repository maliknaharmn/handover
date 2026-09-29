import { redirect, notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/login");
  return { supabase, userId: data.claims.sub };
});

export const requireOrg = cache(async (slug: string) => {
  const { supabase, userId } = await requireUser();
  const { data: org } = await supabase.from("organizations")
    .select("id,slug,name,timezone,logo_url")
    .eq("slug", slug).single();
  if (!org) notFound();
  const { data: member } = await supabase.from("organization_members")
    .select("roles,is_active")
    .eq("organization_id", org.id).eq("user_id", userId).eq("is_active", true).single();
  if (!member) notFound();
  return { supabase, userId, org, roles: member.roles as string[], isAdmin: member.roles.includes("admin") };
});

export async function requireAdmin(slug: string) {
  const context = await requireOrg(slug);
  if (!context.isAdmin) notFound();
  return context;
}
