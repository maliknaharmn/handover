import { setPassword } from "@/app/auth/actions";
import { Field, Feedback } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { requireUser } from "@/lib/handover/context";

export default async function AcceptInvite({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { error } = await searchParams;
  return <main className="mx-auto max-w-md px-5 py-20"><p className="text-sm font-semibold text-primary">KODISIA · Handover</p>
    <h1 className="mt-3 text-3xl font-semibold">Terima undangan</h1>
    <p className="mt-3 text-muted-foreground">Buat password untuk mengaktifkan keanggotaan Anda.</p>
    <Feedback message={error} />
    <form action={setPassword} className="mt-8 space-y-4">
      <input type="hidden" name="next" value="/auth/invite" />
      <Field label="Password (minimal 12 karakter)" name="password" type="password" required minLength={12} />
      <SubmitButton>Aktifkan akun</SubmitButton>
    </form>
  </main>;
}
