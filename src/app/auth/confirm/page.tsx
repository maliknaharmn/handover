"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const allowedTypes = new Set(["invite", "magiclink", "recovery"]);

export default function ConfirmEmail() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function finish() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const type = hash.get("type") ?? url.searchParams.get("type");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const supabase = createClient();
      window.history.replaceState(null, "", url.pathname);

      if (hash.has("error") || url.searchParams.has("error")) {
        setError("Tautan email gagal diverifikasi atau sudah kedaluwarsa. Minta tautan baru.");
        return;
      }

      let session;
      let authError;
      if (accessToken && refreshToken) {
        const result = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        session = result.data.session;
        authError = result.error;
      } else if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        session = result.data.session;
        authError = result.error;
      } else if (tokenHash && type && allowedTypes.has(type)) {
        const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
        session = result.data.session;
        authError = result.error;
      } else {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        authError = result.error;
      }

      if (authError || !session) {
        setError("Sesi tidak dapat dibuat. Buka tautan email terbaru atau minta tautan baru.");
        return;
      }

      const destination = type === "invite" ? "/auth/invite"
        : type === "recovery" ? "/reset-password?mode=update"
          : type === "magiclink" ? "/auth/existing-invite" : "/workspaces";
      router.replace(destination);
    }

    void finish().catch(() => setError("Koneksi terputus saat memverifikasi tautan. Coba buka ulang tautan terbaru."));
  }, [router]);

  return <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-5 py-12">
    <p className="text-sm font-semibold text-primary">Handover · KODISIA</p>
    <h1 className="mt-3 text-3xl font-semibold">Memverifikasi tautan email</h1>
    {error ? <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-red-50 p-4 text-sm text-destructive">{error}</p>
      : <p role="status" className="mt-4 text-sm text-muted-foreground">Tunggu sebentar. Anda akan diarahkan ke langkah berikutnya.</p>}
    {error ? <Link href="/login" className="mt-5 text-sm font-medium text-primary underline">Kembali ke halaman masuk</Link> : null}
  </main>;
}
