import Link from "next/link";
import { requireHandover } from "@/lib/handover/data";
import { ActivityList, type Activity } from "@/components/handover/activity-list";

export default async function HandoverActivity({ params, searchParams }: { params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ page?: string }> }) {
  const { slug, id } = await params;
  const { supabase, org } = await requireHandover(slug,id);
  const page = Math.max(1, Math.min(100, Number((await searchParams).page) || 1));
  const { data: logs } = await supabase.from("activity_logs")
    .select("id,handover_id,item_id,subject_type,subject_id,actor_id,actor_label,event_type,summary,old_status,new_status,reason,created_at")
    .eq("organization_id",org.id).eq("handover_id",id).order("created_at",{ ascending:false }).range((page-1)*100,page*100-1);
  const ids = [...new Set((logs ?? []).map((l) => l.actor_id).filter((value): value is string => !!value))];
  const itemIds = [...new Set((logs ?? []).map((log) => log.item_id).filter((value): value is string => !!value))];
  const [profilesResult, itemsResult] = await Promise.all([
    ids.length ? supabase.from("profiles").select("id,display_name").in("id",ids) : Promise.resolve({ data: [] }),
    itemIds.length ? supabase.from("handover_items").select("id,title").in("id",itemIds) : Promise.resolve({ data: [] }),
  ]);
  const profiles = profilesResult.data;
  const names = new Map((profiles ?? []).map((p) => [p.id,p.display_name]));
  const itemNames = new Map((itemsResult.data ?? []).map((item) => [item.id,item.title]));
  return <div><h1 className="mb-6 text-3xl font-semibold">Aktivitas handover</h1>
    <ActivityList entries={(logs ?? []) as Activity[]} names={names} itemNames={itemNames} slug={slug} timezone={org.timezone} />
    <div className="mt-5 flex gap-4 text-sm">{page > 1 ? <Link href={`?page=${page-1}`} className="text-primary underline">← Sebelumnya</Link> : null}
      {logs?.length === 100 ? <Link href={`?page=${page+1}`} className="text-primary underline">Berikutnya →</Link> : null}</div></div>;
}
