import { requireAdmin } from "@/lib/handover/context";
import { Field, Feedback, Panel } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { updateOrganization } from "../admin-actions";

export default async function Settings({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { org } = await requireAdmin(slug);
  const feedback = await searchParams;
  return <><Feedback {...feedback} /><Panel title="Identitas organisasi">
    <form action={updateOrganization.bind(null, slug)} className="grid max-w-xl gap-4">
      <Field label="Nama organisasi" name="name" required defaultValue={org.name} minLength={2} maxLength={120} />
      <Field label="URL logo (opsional, HTTPS)" name="logo_url" type="url" defaultValue={org.logo_url ?? ""} />
      <p className="text-sm text-muted-foreground">Zona waktu pilot: {org.timezone}. Alamat workspace: /org/{org.slug}</p>
      <SubmitButton>Simpan organisasi</SubmitButton>
    </form>
  </Panel></>;
}
