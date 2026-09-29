import Link from "next/link";
import { requireAdmin } from "@/lib/handover/context";

export default async function SettingsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireAdmin(slug);
  const pages = [["Organisasi", ""], ["Anggota", "/members"], ["Periode", "/periods"], ["Posisi", "/positions"], ["Template", "/templates"]];
  return <div><h1 className="mb-5 text-3xl font-semibold tracking-tight">Pengaturan</h1>
    <nav aria-label="Pengaturan" className="mb-7 flex flex-wrap gap-2">{pages.map(([label, suffix]) =>
      <Link key={suffix} href={`/org/${slug}/settings${suffix}`} className="rounded-full border bg-white px-4 py-2 text-sm hover:border-primary">{label}</Link>)}</nav>
    {children}</div>;
}
