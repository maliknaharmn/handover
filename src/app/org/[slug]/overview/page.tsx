import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import { getMetrics } from "@/lib/handover/data";
import { MetricsView } from "@/components/handover/progress";
import { Empty, Panel, Status } from "@/components/handover/ui";
import { refreshDueNotifications } from "./actions";

export default async function Overview({ params, searchParams }: { params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }> }) {
  const { slug } = await params;
  const { supabase, org, userId, isAdmin } = await requireOrg(slug);
  const [handoverResult, taskCountsResult, outgoingResult, incomingResult, notificationResult] = await Promise.all([
    supabase.from("handovers").select("id,status,from_period_id,to_period_id").eq("organization_id",org.id).eq("status","active").order("activated_at",{ ascending:false }),
    supabase.rpc("my_task_counts",{ p_organization_id: org.id }),
    supabase.rpc("my_tasks",{ p_organization_id: org.id, p_kind: "outgoing", p_limit: 5, p_offset: 0 }),
    supabase.rpc("my_tasks",{ p_organization_id: org.id, p_kind: "incoming", p_limit: 5, p_offset: 0 }),
    supabase.from("notifications").select("id",{ count:"exact", head:true }).eq("organization_id",org.id).eq("recipient_id",userId).is("read_at",null),
  ]);
  const handovers = handoverResult.data ?? [];
  const metrics = await Promise.all(handovers.map((h) => getMetrics(slug,h.id)));
  const counts = taskCountsResult.data as { outgoing:number; incoming:number } | null;
  const pendingCount = (counts?.outgoing ?? 0) + (counts?.incoming ?? 0);
  const myPending = [...(incomingResult.data ?? []),...(outgoingResult.data ?? [])].slice(0,5);
  const feedback = await searchParams;
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-3"><div>
    <p className="text-sm font-semibold text-primary">Workspace {org.name}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Ringkasan transisi</h1>
    <p className="mt-2 text-sm text-muted-foreground">Progres berasal dari item wajib yang telah diverifikasi.</p></div>
    <Link href={`/org/${slug}/my-tasks`} className="min-h-11 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Lihat tugas saya ({pendingCount})</Link></div>
    {feedback.error ? <p role="alert" className="text-sm text-destructive">{feedback.error}</p> : null}
    {feedback.success ? <p className="text-sm text-green-900">{feedback.success}</p> : null}
    {isAdmin ? <form action={refreshDueNotifications.bind(null,slug)}><button className="min-h-10 rounded-full border px-4 text-sm text-primary">Perbarui pengingat tenggat</button></form> : null}
    {handovers.length ? handovers.map((h,index) => <Panel key={h.id} title="Handover aktif" action={<Link href={`/org/${slug}/handovers/${h.id}`} className="text-sm text-primary underline">Buka handover →</Link>}>
      <MetricsView metrics={metrics[index]} /></Panel>) : <Panel title="Belum ada handover aktif"><Empty text="Handover belum diaktifkan. Admin dapat menyiapkan periode, penanggung jawab, dan item wajib." href={isAdmin ? `/org/${slug}/handovers` : undefined} cta="Siapkan handover" /></Panel>}
    <div className="grid gap-6 lg:grid-cols-2"><Panel title="Menunggu tindakan saya" action={<Link href={`/org/${slug}/my-tasks`} className="text-sm text-primary underline">Semua tugas</Link>}>
      {myPending.length ? <ul className="divide-y">{myPending.slice(0,5).map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
        <Link href={`/org/${slug}/handovers/${item.handover_id}/items/${item.id}`} className="font-medium text-primary underline">{item.title}</Link><Status value={item.status} />
      </li>)}</ul> : <Empty text="Tidak ada tindakan yang menunggu Anda saat ini." />}</Panel>
      <Panel title="Notifikasi"><p className="text-3xl font-semibold tabular-nums">{notificationResult.count ?? 0}</p>
        <p className="mt-1 text-sm text-muted-foreground">Belum dibaca</p><Link href={`/org/${slug}/notifications`} className="mt-4 inline-block text-sm text-primary underline">Lihat notifikasi →</Link></Panel></div>
  </div>;
}
