import { requireHandover } from "@/lib/handover/data";
import { ItemSearch } from "@/components/handover/item-search";

export default async function Items({ params, searchParams }: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ q?: string; status?: string | string[]; category?: string; position?: string; owner?: string; page?: string }>;
}) {
  const { slug, id } = await params;
  await requireHandover(slug,id);
  return <><h1 className="mb-6 text-3xl font-semibold">Item handover</h1><ItemSearch slug={slug} handoverId={id} search={await searchParams} /></>;
}
