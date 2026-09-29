import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { requireOrg } from "@/lib/handover/context";
import { WorkspaceNav } from "@/components/handover/workspace-nav";

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { org, isAdmin } = await requireOrg(slug);
  const base = `/org/${org.slug}`;
  const nav = [
    { label: "Ringkasan", href: `${base}/overview` }, { label: "Tugas saya", href: `${base}/my-tasks` },
    { label: "Handovers", href: `${base}/handovers` }, { label: "Pengetahuan", href: `${base}/search` },
    { label: "Aktivitas", href: `${base}/activity` }, { label: "Notifikasi", href: `${base}/notifications` },
    ...(isAdmin ? [{ label: "Pengaturan", href: `${base}/settings` }] : []),
  ];
  return <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
    <aside className="hidden border-r border-border bg-white px-4 py-6 lg:block">
      <Link href="/workspaces" className="block px-3 text-xl font-semibold tracking-tight text-primary">Handover</Link>
      <p className="mb-8 mt-1 px-3 text-xs text-muted-foreground">Workspace KODISIA</p>
      <WorkspaceNav links={nav} />
      <div className="mt-10 border-t px-3 pt-5 text-xs text-muted-foreground">Transfer pengetahuan yang dapat ditelusuri.</div>
    </aside>
    <div className="min-w-0">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><Link href="/workspaces" className="text-lg font-semibold text-primary lg:hidden">Handover</Link>
            <span className="text-sm font-semibold text-[var(--brand-dark)]">{org.name}</span></div>
          <div className="flex items-center gap-4 text-sm"><Link href={`${base}/search`} className="text-primary underline underline-offset-4">Cari</Link>
            <Link href={`${base}/notifications`} className="text-primary underline underline-offset-4">Notifikasi</Link>
            <form action={signOut}><button className="min-h-10 text-muted-foreground underline underline-offset-4">Keluar</button></form></div>
        </div>
        <details className="border-t px-4 py-2 lg:hidden"><summary className="cursor-pointer py-2 text-sm font-semibold">Menu workspace</summary>
          <div className="pb-3 pt-2"><WorkspaceNav links={nav} /></div></details>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  </div>;
}
