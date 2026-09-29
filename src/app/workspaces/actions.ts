"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/handover/context";
import { backWithMessage } from "@/lib/handover/navigation";

export async function bootstrapKodisia() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("bootstrap_kodisia");
  if (error) redirect(backWithMessage("/workspaces", error.message));
  redirect("/org/kodisia/overview");
}

export async function acceptPendingInvite() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("accept_invitation");
  if (error) redirect(backWithMessage("/workspaces", error.message));
  redirect(backWithMessage("/workspaces", undefined, "Undangan diterima."));
}
