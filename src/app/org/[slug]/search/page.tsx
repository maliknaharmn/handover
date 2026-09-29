import { ItemSearch } from "@/components/handover/item-search";

export default async function Search({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string | string[]; category?: string; position?: string; owner?: string; page?: string }>;
}) {
  const { slug } = await params;
  return <><h1 className="mb-6 text-3xl font-semibold">Cari pengetahuan KODISIA</h1><ItemSearch slug={slug} search={await searchParams} /></>;
}
