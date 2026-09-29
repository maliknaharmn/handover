"use server";

import { redirect } from "next/navigation";
import { requireItem } from "@/lib/handover/data";
import { backWithMessage, textValue } from "@/lib/handover/navigation";

function itemPath(slug: string, handoverId: string, itemId: string) {
  return `/org/${slug}/handovers/${handoverId}/items/${itemId}`;
}
function finish(path: string, error?: string): never {
  redirect(backWithMessage(path, error, error ? undefined : "Perubahan tersimpan."));
}

export type ItemFormState = { error: string; values: Record<string,string>; revision: number };

export async function saveItemState(slug: string, handoverId: string, itemId: string,
  previous: ItemFormState, form: FormData): Promise<ItemFormState> {
  const { supabase } = await requireItem(slug, handoverId, itemId);
  const path = itemPath(slug, handoverId, itemId);
  const values: Record<string,string> = {};
  for (const [key,value] of form.entries()) if (typeof value === "string" && !key.startsWith("$ACTION_")) values[key] = value;
  const details: Record<string, string> = {};
  for (const key of ["asset_type","current_owner","transfer_status","secure_channel","document_name","version_label",
    "owner","goal","schedule","evaluation","recommendation","name","affiliation","role","contact","context",
    "communication_notes","task_description","task_due_on","priority","work_status","vendor"]) {
    const value = textValue(form, key, 4000);
    if (value) details[key] = value;
  }
  const { error } = await supabase.rpc("change_item", { p_item_id: itemId,
    p_version: Number(form.get("version")), p_action: form.get("mode") === "admin_correct" ? "admin_correct" : "save",
    p_payload: { title: textValue(form, "title", 200), description: textValue(form, "description", 8000),
      notes: textValue(form, "notes", 8000), reference_label: textValue(form, "reference_label", 200),
      reference_url: textValue(form, "reference_url", 2048), details, reason: textValue(form, "reason", 4000) } });
  if (error) return { error: error.message, values, revision: previous.revision + 1 };
  redirect(backWithMessage(path,undefined,"Draft tersimpan."));
}

export async function transitionItem(slug: string, handoverId: string, itemId: string, form: FormData) {
  const { supabase } = await requireItem(slug, handoverId, itemId);
  const path = itemPath(slug, handoverId, itemId);
  const action = textValue(form, "action", 20);
  if (!["submit", "verify", "revise", "reopen", "comment"].includes(action)) finish(path, "Aksi tidak dikenal.");
  const { error } = await supabase.rpc("change_item", { p_item_id: itemId,
    p_version: Number(form.get("version")), p_action: action,
    p_payload: { reason: textValue(form, "reason", 4000), body: textValue(form, "body", 4000) } });
  finish(path, error?.message);
}

export async function configureItem(slug: string, handoverId: string, itemId: string, form: FormData) {
  const { supabase, isAdmin } = await requireItem(slug, handoverId, itemId);
  const path = itemPath(slug, handoverId, itemId);
  if (!isAdmin) finish(path, "Hanya admin yang dapat mengubah penugasan.");
  const { error } = await supabase.rpc("configure_item", { p_item_id: itemId,
    p_version: Number(form.get("version")), p_assignment_id: textValue(form, "assignment_id", 36),
    p_category_id: textValue(form, "category_id", 36), p_required: form.get("is_required") === "on",
    p_active: form.get("is_active") === "on", p_due_on: textValue(form, "due_on", 10) || null,
    p_reason: textValue(form, "reason", 4000) });
  finish(path, error?.message);
}
