import Link from "next/link";
import { localDateTime } from "@/lib/handover/types";
import { Empty } from "./ui";

export type Activity = { id: number; handover_id: string | null; item_id: string | null; actor_id: string | null;
  actor_label: string;
  subject_type: string | null; subject_id: string | null; event_type: string; summary: string;
  old_status: string | null; new_status: string | null; reason: string | null; created_at: string };

export function ActivityList({ entries, names, itemNames, slug, timezone }: { entries: Activity[]; names: Map<string,string>;
  itemNames: Map<string,string>; slug: string; timezone: string }) {
  return entries.length ? <ol className="divide-y border-y border-border">{entries.map((entry) => <li key={entry.id} className="grid gap-1 py-4 text-sm sm:grid-cols-[9rem_1fr] sm:gap-4">
    <time className="text-xs tabular-nums text-muted-foreground">{localDateTime(entry.created_at,timezone)}</time>
    <div><p><strong>{entry.actor_id ? names.get(entry.actor_id) || entry.actor_label : "Sistem"}</strong> · {entry.summary}</p>
      {entry.old_status && entry.new_status && entry.old_status !== entry.new_status ? <p className="mt-1 text-xs text-muted-foreground">{entry.old_status} → {entry.new_status}</p> : null}
      {entry.reason ? <p className="mt-1 text-xs text-muted-foreground">Alasan: {entry.reason}</p> : null}
      {entry.handover_id ? <Link href={`/org/${slug}/handovers/${entry.handover_id}${entry.item_id ? `/items/${entry.item_id}` : ""}`} className="mt-1 inline-block text-xs text-primary underline">
        {entry.item_id ? itemNames.get(entry.item_id) || "Lihat item" : "Lihat handover"} →</Link> : null}
      {!entry.handover_id && entry.subject_type && entry.subject_id ? <p className="mt-1 text-xs text-muted-foreground">Objek: {entry.subject_type} · {entry.subject_id.slice(0,8)}</p> : null}</div>
  </li>)}</ol> : <Empty text="Belum ada aktivitas yang tercatat." />;
}
