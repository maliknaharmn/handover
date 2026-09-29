"use server";

import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/handover/context";
import { backWithMessage } from "@/lib/handover/navigation";

export async function markRead(slug: string, form: FormData) {
  const { supabase, org, userId } = await requireOrg(slug);
  const id = String(form.get("id") ?? "");
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() })
    .eq("id",id).eq("organization_id",org.id).eq("recipient_id",userId);
  redirect(backWithMessage(`/org/${slug}/notifications`,error?.message));
}
