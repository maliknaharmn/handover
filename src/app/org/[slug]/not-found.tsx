import Link from "next/link";

export default function NotFound() {
  return <div className="max-w-xl rounded-xl border bg-white p-6">
    <h1 className="text-2xl font-semibold">Halaman tidak tersedia</h1>
    <p className="mt-2 text-sm text-muted-foreground">Tautan tidak ditemukan atau akun Anda tidak memiliki akses ke data tersebut.</p>
    <Link href="/workspaces" className="mt-5 inline-block text-sm font-semibold text-primary underline">Pilih workspace</Link>
  </div>;
}
