import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import type { Item } from "@/lib/handover/types";
import { Empty, Panel, Status } from "@/components/handover/ui";

export default async function MyTasks({ params, searchParams }: { params: Promise<{ slug: string }>;
  searchParams: Promise<{ out?: string; review?: string }> }) {
  const { slug } = await params;
  const { supabase, org } = await requireOrg(slug);
  const search = await searchParams;
  const outPage = Math.max(1, Math.min(200, Number(search.out) || 1));
  const reviewPage = Math.max(1, Math.min(200, Number(search.review) || 1));
  const [outResult, reviewResult, countsResult] = await Promise.all([
    supabase.rpc("my_tasks",{ p_organization_id: org.id, p_kind:"outgoing", p_limit:50, p_offset:(outPage-1)*50 }),
    supabase.rpc("my_tasks",{ p_organization_id: org.id, p_kind:"incoming", p_limit:50, p_offset:(reviewPage-1)*50 }),
    supabase.rpc("my_task_counts",{ p_organization_id: org.id }),
  ]);
  const outgoing = (outResult.data ?? []) as Item[];
  const incoming = (reviewResult.data ?? []) as Item[];
  const counts = countsResult.data as { outgoing:number; incoming:number } | null;
  const list = (entries: Item[], page: number, kind: "out" | "review") => entries.length ? <>
    <ul className="divide-y">{entries.map((item) => <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4 text-sm">
      <div><Link href={`/org/${slug}/handovers/${item.handover_id}/items/${item.id}`} className="font-semibold text-primary underline underline-offset-4">{item.title}</Link>
        <p className="mt-1 text-muted-foreground">{item.is_required ? "Wajib" : "Opsional"}{item.due_on ? ` · Tenggat ${item.due_on}` : ""}</p></div><Status value={item.status} />
    </li>)}</ul>
    <div className="mt-4 flex gap-4 text-sm">{page > 1 ? <Link className="text-primary underline" href={`?out=${kind === "out" ? page - 1 : outPage}&review=${kind === "review" ? page - 1 : reviewPage}`}>← Sebelumnya</Link> : null}
      {entries.length === 50 ? <Link className="text-primary underline" href={`?out=${kind === "out" ? page + 1 : outPage}&review=${kind === "review" ? page + 1 : reviewPage}`}>Berikutnya →</Link> : null}</div>
  </> : <Empty text="Tidak ada item yang membutuhkan tindakan." />;
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">Tugas saya</h1>
    <div className="grid gap-6 lg:grid-cols-2"><Panel title={`Perlu saya serahkan · ${counts?.outgoing ?? 0}`}>{list(outgoing,outPage,"out")}</Panel>
      <Panel title={`Perlu saya review · ${counts?.incoming ?? 0}`}>{list(incoming,reviewPage,"review")}</Panel></div>
  </div>;
}
