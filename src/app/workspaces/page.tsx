import Link from "next/link";
import { requireUser } from "@/lib/handover/context";
import { acceptPendingInvite, bootstrapKodisia } from "./actions";
import { Feedback, Panel } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";

export default async function Workspaces({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { supabase, userId } = await requireUser();
  const { error, success } = await searchParams;
  const { data: memberships } = await supabase.from("organization_members")
    .select("organization_id,roles").eq("user_id", userId).eq("is_active", true);
  const ids = (memberships ?? []).map((m) => m.organization_id);
  const { data: organizations } = ids.length ? await supabase.from("organizations")
    .select("id,slug,name").in("id", ids).order("name") : { data: [] };
  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 sm:py-20">
    <p className="text-sm font-semibold text-primary">Handover · KODISIA</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight">Pilih workspace</h1>
    <p className="mt-3 text-muted-foreground">Hanya organisasi tempat Anda menjadi anggota aktif yang ditampilkan.</p>
    <div className="mt-8"><Feedback message={error} success={success} /></div>
    <div className="space-y-4">{(organizations ?? []).map((org) =>
      <Link key={org.id} href={`/org/${org.slug}/overview`} className="block rounded-2xl border bg-white p-6 shadow-sm transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
        <span className="text-lg font-semibold">{org.name}</span><span className="ml-3 text-sm text-muted-foreground">Buka workspace →</span>
      </Link>)}</div>
    {!organizations?.length ? <div className="mt-6 space-y-4">
      <Panel title="Belum ada workspace"><p className="mb-4 text-sm text-muted-foreground">Jika Anda admin pertama KODISIA yang telah disetujui, buat workspace awal di sini.</p>
        <form action={bootstrapKodisia}><SubmitButton>Buat workspace KODISIA</SubmitButton></form></Panel>
      <Panel title="Punya undangan?"><p className="mb-4 text-sm text-muted-foreground">Terima undangan yang sesuai email akun Anda.</p>
        <form action={acceptPendingInvite}><SubmitButton>Terima undangan</SubmitButton></form></Panel>
    </div> : null}
  </main>;
}
