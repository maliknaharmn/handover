"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/handover/context";
import { backWithMessage } from "@/lib/handover/navigation";

export async function refreshDueNotifications(slug: string) {
  const { supabase, org } = await requireAdmin(slug);
  const { error } = await supabase.rpc("due_notifications", { p_organization_id: org.id });
  redirect(backWithMessage(`/org/${slug}/overview`, error?.message,
    error ? undefined : "Pengingat tenggat diperbarui."));
}
