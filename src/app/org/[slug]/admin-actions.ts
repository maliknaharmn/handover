"use server";

import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/handover/context";
import { backWithMessage, textValue } from "@/lib/handover/navigation";

function done(path: string, error?: string, success = "Perubahan tersimpan."): never {
  redirect(backWithMessage(path, error, error ? undefined : success));
}
function dateOrNull(form: FormData, key: string) { return textValue(form, key, 10) || null; }
function roles(form: FormData) {
  const values = form.getAll("roles").map(String).filter((value) => ["admin", "outgoing", "incoming"].includes(value));
  return [...new Set(values)];
}

export async function updateOrganization(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const name = textValue(form, "name", 120);
  const logo = textValue(form, "logo_url", 2048);
  if (name.length < 2 || (logo && !logo.startsWith("https://"))) done(`/org/${slug}/settings`, "Nama atau URL logo tidak valid.");
  const { error } = await supabase.from("organizations").update({ name, logo_url: logo || null }).eq("id", org.id);
  done(`/org/${slug}/settings`, error?.message);
}

export async function inviteMember(slug: string, form: FormData) {
  const { supabase, org, userId } = await requireAdmin(slug);
  const email = textValue(form, "email", 320).toLowerCase();
  const memberRoles = roles(form);
  const path = `/org/${slug}/settings/members`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !memberRoles.length) done(path, "Email dan minimal satu role diperlukan.");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) done(path, "Layanan undangan belum dikonfigurasi oleh pemilik proyek.");
  const { data: invitation, error: recordError } = await supabase.from("organization_invitations")
    .insert({ organization_id: org.id, email, roles: memberRoles, invited_by: userId })
    .select("id").single();
  if (recordError || !invitation) done(path, recordError?.message ?? "Undangan gagal disimpan.");
  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let { error: sendError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });
  if (sendError && ["email_exists", "user_already_exists"].includes(sendError.code ?? "")) {
    const loginClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const link = await loginClient.auth.signInWithOtp({ email, options: { shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm` } });
    sendError = link.error;
  }
  if (sendError) {
    await supabase.from("organization_invitations").update({ status: "revoked" }).eq("id", invitation.id);
    const message = sendError.code === "email_address_not_authorized"
      ? "Undangan belum terkirim. Atur SMTP khusus di Supabase untuk mengirim ke alamat di luar tim proyek."
      : `Undangan belum terkirim: ${sendError.message}`;
    done(path, message);
  }
  done(path, undefined, "Undangan dikirim.");
}

export async function updateMember(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const userId = textValue(form, "user_id", 36);
  const memberRoles = roles(form);
  const isActive = form.get("is_active") === "on";
  const path = `/org/${slug}/settings/members`;
  if (!memberRoles.length) done(path, "Minimal satu role diperlukan.");
  const { error } = await supabase.from("organization_members")
    .update({ roles: memberRoles, is_active: isActive })
    .eq("organization_id", org.id).eq("user_id", userId);
  done(path, error?.message);
}

export async function revokeInvitation(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/members`;
  const { error } = await supabase.from("organization_invitations").update({ status: "revoked" })
    .eq("id", textValue(form,"id",36)).eq("organization_id",org.id).eq("status","pending");
  done(path,error?.message);
}

export async function createPeriod(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const label = textValue(form, "label", 100);
  const path = `/org/${slug}/settings/periods`;
  if (label.length < 2) done(path, "Label periode minimal dua karakter.");
  const { error } = await supabase.from("periods").insert({ organization_id: org.id, label,
    starts_on: dateOrNull(form, "starts_on"), ends_on: dateOrNull(form, "ends_on") });
  done(path, error?.message);
}

export async function updatePeriod(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/periods`;
  const label = textValue(form,"label",100);
  if (label.length < 2) done(path,"Label periode minimal dua karakter.");
  const { error } = await supabase.from("periods").update({ label,
    starts_on: dateOrNull(form,"starts_on"), ends_on: dateOrNull(form,"ends_on") })
    .eq("id",textValue(form,"id",36)).eq("organization_id",org.id);
  done(path,error?.message);
}

export async function createPosition(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const name = textValue(form, "name", 100);
  const path = `/org/${slug}/settings/positions`;
  if (name.length < 2) done(path, "Nama posisi minimal dua karakter.");
  const { error } = await supabase.from("positions").insert({ organization_id: org.id, name,
    division: textValue(form, "division", 100) || null });
  done(path, error?.message);
}

export async function updatePosition(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/positions`;
  const name = textValue(form,"name",100);
  if (name.length < 2) done(path,"Nama posisi minimal dua karakter.");
  const { error } = await supabase.from("positions").update({ name, division: textValue(form,"division",100) || null,
    is_active: form.get("is_active") === "on" }).eq("id",textValue(form,"id",36)).eq("organization_id",org.id);
  done(path,error?.message);
}

export async function assignPosition(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/positions`;
  const { error } = await supabase.from("position_assignments").insert({ organization_id: org.id,
    period_id: textValue(form, "period_id", 36), position_id: textValue(form, "position_id", 36), user_id: textValue(form, "user_id", 36) });
  done(path, error?.message);
}

export async function removePositionAssignment(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/positions`;
  const { error } = await supabase.from("position_assignments").delete()
    .eq("organization_id",org.id).eq("period_id",textValue(form,"period_id",36))
    .eq("position_id",textValue(form,"position_id",36)).eq("user_id",textValue(form,"user_id",36));
  done(path,error?.message);
}

export async function createHandover(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers`;
  const from = textValue(form, "from_period_id", 36), to = textValue(form, "to_period_id", 36);
  if (from === to) done(path, "Periode asal dan tujuan harus berbeda.");
  const { data, error } = await supabase.from("handovers").insert({ organization_id: org.id,
    from_period_id: from, to_period_id: to, due_on: dateOrNull(form, "due_on") }).select("id").single();
  if (error || !data) done(path, error?.message ?? "Gagal membuat handover.");
  redirect(`/org/${slug}/handovers/${data.id}`);
}

export async function updateHandover(slug: string, handoverId: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const from = textValue(form,"from_period_id",36), to = textValue(form,"to_period_id",36);
  if (from === to) done(path,"Periode asal dan tujuan harus berbeda.");
  const { error } = await supabase.from("handovers").update({ from_period_id: from, to_period_id: to,
    due_on: dateOrNull(form,"due_on") }).eq("id",handoverId).eq("organization_id",org.id).eq("status","draft");
  done(path,error?.message);
}

export async function createHandoverAssignment(slug: string, handoverId: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const outgoing = textValue(form, "outgoing_user_id", 36), incoming = textValue(form, "incoming_user_id", 36);
  if (outgoing === incoming) done(path, "Penyerah dan penerima harus berbeda.");
  const { error } = await supabase.from("handover_assignments").insert({ organization_id: org.id, handover_id: handoverId,
    position_id: textValue(form, "position_id", 36), outgoing_user_id: outgoing, incoming_user_id: incoming });
  done(path, error?.message);
}

export async function reassignHandoverPosition(slug: string, handoverId: string, form: FormData) {
  const { supabase } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const { error } = await supabase.rpc("reassign_handover_position", {
    p_assignment_id: textValue(form, "assignment_id", 36),
    p_outgoing: textValue(form, "outgoing_user_id", 36),
    p_incoming: textValue(form, "incoming_user_id", 36),
    p_reason: textValue(form, "reason", 4000),
  });
  done(path, error?.message);
}

export async function createCategory(slug: string, handoverId: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const name = textValue(form, "name", 80);
  if (name.length < 2) done(path, "Nama kategori minimal dua karakter.");
  const { error } = await supabase.from("handover_categories").insert({ organization_id: org.id, handover_id: handoverId, name });
  done(path, error?.message);
}

export async function updateCategory(slug: string, handoverId: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const name = textValue(form,"name",80);
  if (name.length < 2) done(path,"Nama kategori minimal dua karakter.");
  const { error } = await supabase.from("handover_categories").update({ name })
    .eq("id",textValue(form,"id",36)).eq("organization_id",org.id).eq("handover_id",handoverId);
  done(path,error?.message);
}

export async function createItem(slug: string, handoverId: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const title = textValue(form, "title", 200);
  if (title.length < 2) done(path, "Judul item minimal dua karakter.");
  const { error } = await supabase.from("handover_items").insert({ organization_id: org.id, handover_id: handoverId,
    assignment_id: textValue(form, "assignment_id", 36), category_id: textValue(form, "category_id", 36),
    title, is_required: form.get("is_required") === "on", due_on: dateOrNull(form, "due_on") });
  done(path, error?.message);
}

export async function changeHandoverAction(slug: string, handoverId: string, form: FormData) {
  const { supabase } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const { error } = await supabase.rpc("change_handover", { p_handover_id: handoverId,
    p_action: textValue(form, "action", 20), p_reason: textValue(form, "reason", 4000) || null });
  done(path, error?.message);
}

export async function createTemplate(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/templates`;
  const name = textValue(form, "name", 120);
  if (name.length < 2) done(path, "Nama template minimal dua karakter.");
  const { error } = await supabase.from("checklist_templates").insert({ organization_id: org.id, name });
  done(path, error?.message);
}

export async function createTemplateItem(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/templates`;
  const title = textValue(form, "title", 200);
  if (title.length < 2) done(path, "Judul template item minimal dua karakter.");
  const { error } = await supabase.from("checklist_template_items").insert({ organization_id: org.id,
    template_id: textValue(form, "template_id", 36), category_name: textValue(form, "category_name", 80),
    title, description: textValue(form, "description", 4000), is_required: form.get("is_required") === "on" });
  done(path, error?.message);
}

export async function updateTemplateItem(slug: string, form: FormData) {
  const { supabase, org } = await requireAdmin(slug);
  const path = `/org/${slug}/settings/templates`;
  const title = textValue(form,"title",200);
  if (title.length < 2) done(path,"Judul template item minimal dua karakter.");
  const { error } = await supabase.from("checklist_template_items").update({
    title, description: textValue(form,"description",4000), category_name: textValue(form,"category_name",80),
    is_required: form.get("is_required") === "on",
  }).eq("id",textValue(form,"id",36)).eq("organization_id",org.id);
  done(path,error?.message);
}

export async function applyTemplate(slug: string, handoverId: string, form: FormData) {
  const { supabase } = await requireAdmin(slug);
  const path = `/org/${slug}/handovers/${handoverId}`;
  const { error } = await supabase.rpc("apply_template", { p_template_id: textValue(form, "template_id", 36),
    p_assignment_id: textValue(form, "assignment_id", 36) });
  done(path, error?.message);
}
