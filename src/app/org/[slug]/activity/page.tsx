import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import { ActivityList, type Activity } from "@/components/handover/activity-list";

export default async function ActivityPage({ params, searchParams }: { params: Promise<{ slug: string }>;
  searchParams: Promise<{ actor?: string; from?: string; to?: string; page?: string }> }) {
  const { slug } = await params;
  const { supabase, org } = await requireOrg(slug);
  const filter = await searchParams;
  const page = Math.max(1, Math.min(100, Number(filter.page) || 1));
  let query = supabase.from("activity_logs").select("id,handover_id,item_id,subject_type,subject_id,actor_id,actor_label,event_type,summary,old_status,new_status,reason,created_at")
    .eq("organization_id",org.id).order("created_at",{ ascending:false }).range((page-1)*100,page*100-1);
  if (filter.actor && /^[0-9a-f-]{36}$/i.test(filter.actor)) query = query.eq("actor_id",filter.actor);
  if (filter.from && /^\d{4}-\d{2}-\d{2}$/.test(filter.from)) query = query.gte("created_at",`${filter.from}T00:00:00+07:00`);
  if (filter.to && /^\d{4}-\d{2}-\d{2}$/.test(filter.to)) query = query.lte("created_at",`${filter.to}T23:59:59+07:00`);
  const [logs, members] = await Promise.all([query,
    supabase.from("organization_members").select("user_id").eq("organization_id",org.id)]);
  const ids = members.data?.map((m) => m.user_id) ?? [];
  const itemIds = [...new Set((logs.data ?? []).map((log) => log.item_id).filter((value): value is string => !!value))];
  const [profilesResult, itemsResult] = await Promise.all([
    ids.length ? supabase.from("profiles").select("id,display_name").in("id",ids) : Promise.resolve({ data: [] }),
    itemIds.length ? supabase.from("handover_items").select("id,title").in("id",itemIds) : Promise.resolve({ data: [] }),
  ]);
  const profiles = profilesResult.data;
  const names = new Map((profiles ?? []).map((p) => [p.id,p.display_name]));
  const itemNames = new Map((itemsResult.data ?? []).map((item) => [item.id,item.title]));
  const nextQuery = new URLSearchParams();
  for (const key of ["actor","from","to"] as const) if (filter[key]) nextQuery.set(key,filter[key]);
  return <div><h1 className="text-3xl font-semibold">Aktivitas</h1><p className="mt-2 text-sm text-muted-foreground">Riwayat perubahan organisasi; entri tidak dapat diubah.</p>
    <form className="my-6 grid gap-3 sm:grid-cols-4"><label className="text-sm">Aktor<select name="actor" defaultValue={filter.actor ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border bg-white px-3">
      <option value="">Semua</option>{ids.map((id) => <option key={id} value={id}>{names.get(id) || id}</option>)}</select></label>
      <label className="text-sm">Dari<input name="from" type="date" defaultValue={filter.from ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border bg-white px-3" /></label>
      <label className="text-sm">Sampai<input name="to" type="date" defaultValue={filter.to ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border bg-white px-3" /></label>
      <button className="self-end rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Terapkan</button></form>
    <ActivityList entries={(logs.data ?? []) as Activity[]} names={names} itemNames={itemNames} slug={slug} timezone={org.timezone} />
    <div className="mt-5 flex gap-4 text-sm">{page > 1 ? <Link href={`?${nextQuery.toString()}&page=${page-1}`} className="text-primary underline">← Sebelumnya</Link> : null}
      {logs.data?.length === 100 ? <Link href={`?${nextQuery.toString()}&page=${page+1}`} className="text-primary underline">Berikutnya →</Link> : null}</div>
  </div>;
}
