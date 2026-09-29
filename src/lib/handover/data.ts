import { notFound } from "next/navigation";
import { cache } from "react";
import { requireOrg } from "./context";
import type { Handover, Item } from "./types";

export const requireHandover = cache(async (slug: string, id: string) => {
  const context = await requireOrg(slug);
  const { data } = await context.supabase.from("handovers").select("*")
    .eq("id", id).eq("organization_id", context.org.id).single();
  if (!data) notFound();
  return { ...context, handover: data as Handover };
});

export const requireItem = cache(async (slug: string, handoverId: string, itemId: string) => {
  const context = await requireHandover(slug, handoverId);
  const { data } = await context.supabase.from("handover_items").select("*")
    .eq("id", itemId).eq("handover_id", handoverId).eq("organization_id", context.org.id).single();
  if (!data) notFound();
  return { ...context, item: data as Item };
});

export type Metrics = {
  overall: { required_total: number; required_verified: number; waiting_review: number; revision_required: number;
    in_progress: number; not_started: number; overdue: number; optional_outstanding: number };
  categories: { name: string; required_total: number; required_verified: number }[];
  positions: { name: string; required_total: number; required_verified: number }[];
};

export async function getMetrics(slug: string, handoverId: string): Promise<Metrics> {
  const { supabase } = await requireHandover(slug, handoverId);
  const { data, error } = await supabase.rpc("handover_metrics", { p_handover_id: handoverId });
  if (error || !data) throw new Error("Progres gagal dimuat.");
  return data as Metrics;
}
