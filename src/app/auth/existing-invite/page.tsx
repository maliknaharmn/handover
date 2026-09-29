import { requireUser } from "@/lib/handover/context";
import { acceptPendingInvite } from "@/app/workspaces/actions";
import { SubmitButton } from "@/components/handover/submit-button";

export default async function ExistingInvite() {
  await requireUser();
  return <main className="mx-auto max-w-md px-5 py-20">
    <p className="text-sm font-semibold text-primary">Handover · KODISIA</p>
    <h1 className="mt-3 text-3xl font-semibold">Gabung ke organisasi</h1>
    <p className="mt-3 text-sm text-muted-foreground">Akun Anda sudah ada. Terima undangan ini untuk membuka workspace yang baru ditugaskan.</p>
    <form action={acceptPendingInvite} className="mt-8"><SubmitButton>Terima undangan</SubmitButton></form>
  </main>;
}
