import { requireAdmin } from "@/lib/handover/context";
import { Field, Feedback, Panel, Empty } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { inviteMember, revokeInvitation, updateMember } from "../../admin-actions";

const allRoles = ["admin", "outgoing", "incoming"];

export default async function Members({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { supabase, org } = await requireAdmin(slug);
  const feedback = await searchParams;
  const [membersResult, invitationsResult] = await Promise.all([
    supabase.from("organization_members").select("user_id,roles,is_active").eq("organization_id", org.id).order("created_at"),
    supabase.from("organization_invitations").select("id,email,roles,status,expires_at").eq("organization_id", org.id).order("created_at", { ascending: false }),
  ]);
  const members = membersResult.data ?? [];
  const { data: profiles } = members.length ? await supabase.from("profiles").select("id,display_name").in("id", members.map((m) => m.user_id)) : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  return <div className="space-y-6"><Feedback {...feedback} />
    <Panel title="Undang anggota"><form action={inviteMember.bind(null, slug)} className="grid max-w-xl gap-4">
      <Field label="Email anggota" name="email" type="email" required />
      <fieldset><legend className="mb-2 text-sm font-medium">Role organisasi</legend><div className="flex flex-wrap gap-4">
        {allRoles.map((role) => <label key={role} className="flex items-center gap-2 text-sm"><input type="checkbox" name="roles" value={role} />{role}</label>)}
      </div></fieldset><SubmitButton>Kirim undangan</SubmitButton>
    </form></Panel>
    <Panel title="Anggota aktif dan nonaktif">{members.length ? <div className="grid gap-3">{members.map((member) =>
      <form key={member.user_id} action={updateMember.bind(null, slug)} className="rounded-xl border p-4">
        <input type="hidden" name="user_id" value={member.user_id} />
        <div className="mb-3 font-medium">{nameById.get(member.user_id) || member.user_id}</div>
        <div className="flex flex-wrap gap-4">{allRoles.map((role) => <label key={role} className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="roles" value={role} defaultChecked={member.roles.includes(role)} />{role}
        </label>)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={member.is_active} />Akses aktif</label></div>
        <div className="mt-4"><SubmitButton>Simpan anggota</SubmitButton></div>
      </form>)}</div> : <Empty text="Belum ada anggota lain." />}</Panel>
    <Panel title="Riwayat undangan">{invitationsResult.data?.length ? <ul className="space-y-2 text-sm">{invitationsResult.data.map((inv) =>
      <li key={inv.id} className="flex flex-wrap justify-between gap-2 border-b py-2"><span>{inv.email} · {inv.roles.join(", ")}</span>
        <span className="flex items-center gap-3">{inv.status}{inv.status === "pending" ? <form action={revokeInvitation.bind(null,slug)}><input type="hidden" name="id" value={inv.id} />
          <button className="text-destructive underline">Cabut undangan</button></form> : null}</span></li>)}</ul> : <Empty text="Belum ada undangan." />}</Panel>
  </div>;
}
