import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { Field, Feedback } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
    <Link href="/" className="mb-10 text-xl font-semibold text-primary">Handover · KODISIA</Link>
    <h1 className="text-3xl font-semibold tracking-tight">Masuk ke workspace</h1>
    <p className="mt-2 text-sm text-muted-foreground">Akses tersedia bagi anggota yang diundang admin.</p>
    <form action={signIn} className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      <Feedback message={error} />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <SubmitButton className="w-full">Masuk</SubmitButton>
      <Link href="/reset-password" className="block text-center text-sm text-primary underline underline-offset-4">Lupa password?</Link>
    </form>
  </main>;
}
