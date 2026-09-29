export type Organization = { id: string; slug: string; name: string; timezone: string; logo_url: string | null };
export type Member = { organization_id: string; user_id: string; roles: string[]; is_active: boolean };
export type Period = { id: string; label: string; starts_on: string | null; ends_on: string | null };
export type Position = { id: string; name: string; division: string | null; is_active: boolean };
export type Handover = { id: string; organization_id: string; from_period_id: string; to_period_id: string; status: string; due_on: string | null; created_at: string };
export type Assignment = { id: string; handover_id: string; position_id: string; outgoing_user_id: string; incoming_user_id: string };
export type Category = { id: string; handover_id: string; name: string; sort_order: number };
export type Item = { id: string; organization_id: string; handover_id: string; assignment_id: string; category_id: string; title: string; description: string; notes: string; details: Record<string, string>; reference_label: string | null; reference_url: string | null; is_required: boolean; is_active: boolean; due_on: string | null; status: string; version: number; updated_at: string; verified_by: string | null; verified_at: string | null };
export type Template = { id: string; name: string; is_active: boolean };

export function localDate(value: string | null, timeZone = "Asia/Jakarta") {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone }).format(new Date(value));
}

export function localDateTime(value: string | null, timeZone = "Asia/Jakarta") {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(value));
}
