import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import { localDateTime } from "@/lib/handover/types";
import { Empty } from "@/components/handover/ui";
import { markRead } from "./actions";

export default async function Notifications({ params, searchParams }: { params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; page?: string }> }) {
  const { slug } = await params;
  const { supabase, org, userId } = await requireOrg(slug);
  const search = await searchParams;
  const page = Math.max(1, Math.min(100, Number(search.page) || 1));
  const { data } = await supabase.from("notifications").select("id,handover_id,item_id,event_type,message,created_at,read_at")
    .eq("organization_id",org.id).eq("recipient_id",userId).order("created_at",{ ascending:false }).range((page-1)*100,page*100-1);
  const { error } = search;
  return <div><h1 className="mb-6 text-3xl font-semibold">Notifikasi</h1>
    {error ? <p role="alert" className="mb-4 text-sm text-destructive">Status baca belum tersimpan: {error}</p> : null}
    {data?.length ? <ol className="divide-y border-y bg-white px-4 sm:px-6">{data.map((n) => <li key={n.id} className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm">
      <div><p className={n.read_at ? "text-foreground" : "font-semibold text-foreground"}>{n.message}</p>
        <time className="mt-1 block text-xs text-muted-foreground">{localDateTime(n.created_at,org.timezone)}</time>
        {n.handover_id && n.item_id ? <Link className="mt-2 inline-block text-primary underline" href={`/org/${slug}/handovers/${n.handover_id}/items/${n.item_id}`}>Buka item →</Link> : null}</div>
      {!n.read_at ? <form action={markRead.bind(null,slug)}><input type="hidden" name="id" value={n.id} />
        <button className="min-h-10 rounded-full border px-4 text-xs font-medium text-primary">Tandai dibaca</button></form> : null}
    </li>)}</ol> : <Empty text="Belum ada notifikasi." />}
    <div className="mt-5 flex gap-4 text-sm">{page > 1 ? <Link href={`?page=${page-1}`} className="text-primary underline">← Sebelumnya</Link> : null}
      {data?.length === 100 ? <Link href={`?page=${page+1}`} className="text-primary underline">Berikutnya →</Link> : null}</div>
  </div>;
}
