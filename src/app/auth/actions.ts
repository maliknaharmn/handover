"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { backWithMessage, safeNext, textValue } from "@/lib/handover/navigation";

export async function signIn(form: FormData) {
  const email = textValue(form, "email", 320).toLowerCase();
  const password = textValue(form, "password", 1024);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(backWithMessage("/login", "Email atau password tidak cocok."));
  redirect("/workspaces");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestReset(form: FormData) {
  const email = textValue(form, "email", 320).toLowerCase();
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm` });
  redirect(backWithMessage("/reset-password", undefined, "Jika akun terdaftar, tautan reset akan dikirim."));
}

export async function setPassword(form: FormData) {
  const password = textValue(form, "password", 1024);
  const next = safeNext(textValue(form, "next", 200));
  if (password.length < 12) redirect(backWithMessage(next === "/auth/invite" ? next : "/reset-password", "Password minimal 12 karakter."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(backWithMessage(next === "/auth/invite" ? next : "/reset-password", "Password gagal diperbarui. Buka ulang tautan email."));
  if (next === "/auth/invite") {
    const result = await supabase.rpc("accept_invitation");
    if (result.error) {
      const bootstrap = await supabase.rpc("bootstrap_kodisia");
      if (bootstrap.error) redirect(backWithMessage("/auth/invite", result.error.message));
    }
  }
  redirect("/workspaces");
}
