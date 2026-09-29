import Link from "next/link";
import { requestReset, setPassword } from "@/app/auth/actions";
import { Field, Feedback } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string; success?: string; mode?: string }> }) {
  const { error, success, mode } = await searchParams;
  return <main className="mx-auto max-w-md px-5 py-20">
    <Link href="/login" className="text-sm text-primary">← Kembali ke login</Link>
    <h1 className="mt-8 text-3xl font-semibold">Reset password</h1>
    <Feedback message={error} success={success} />
    {mode === "update" ? <form action={setPassword} className="mt-6 space-y-4"><input type="hidden" name="next" value="/reset-password" />
      <Field label="Password baru (minimal 12 karakter)" name="password" type="password" required minLength={12} />
      <SubmitButton>Simpan password</SubmitButton></form> :
      <form action={requestReset} className="mt-6 space-y-4"><Field label="Email akun" name="email" type="email" required />
        <SubmitButton>Kirim tautan reset</SubmitButton></form>}
  </main>;
}
