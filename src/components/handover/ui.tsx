import Link from "next/link";

export function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{title}</h2>{action}</div>
    {children}
  </section>;
}

export function Field({ label, name, type = "text", required = false, defaultValue, placeholder, minLength, maxLength }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string | number; placeholder?: string;
  minLength?: number; maxLength?: number;
}) {
  return <label className="flex flex-col gap-1.5 text-sm font-medium">{label}
    <input name={name} type={type} required={required} minLength={minLength} maxLength={maxLength} defaultValue={defaultValue}
      placeholder={placeholder} className="min-h-11 rounded-lg border border-input bg-white px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
  </label>;
}

export function SelectField({ label, name, options, required = true, defaultValue }: {
  label: string; name: string; options: { value: string; label: string }[]; required?: boolean; defaultValue?: string;
}) {
  return <label className="flex flex-col gap-1.5 text-sm font-medium">{label}
    <select name={name} required={required} defaultValue={defaultValue ?? ""}
      className="min-h-11 rounded-lg border border-input bg-white px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <option value="" disabled>Pilih…</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}

export function TextArea({ label, name, defaultValue, rows = 4, required = false, maxLength = 8000, hint }: {
  label: string; name: string; defaultValue?: string; rows?: number; required?: boolean; maxLength?: number; hint?: string;
}) {
  return <label className="flex flex-col gap-1.5 text-sm font-medium">{label}
    <textarea name={name} rows={rows} required={required} maxLength={maxLength} defaultValue={defaultValue}
      className="rounded-lg border border-input bg-white px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
  </label>;
}

export function Empty({ text, href, cta }: { text: string; href?: string; cta?: string }) {
  return <div className="rounded-xl border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
    <p>{text}</p>{href && cta ? <Link className="mt-3 inline-block font-semibold text-primary underline underline-offset-4" href={href}>{cta}</Link> : null}
  </div>;
}

export function Feedback({ message, success }: { message?: string; success?: string }) {
  return <div aria-live="polite">
    {message ? <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-red-50 p-3 text-sm text-destructive">{message}</p> : null}
    {success ? <p className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">{success}</p> : null}
  </div>;
}

export function Status({ value }: { value: string }) {
  const labels: Record<string, string> = {
    not_started: "Belum dimulai", in_progress: "Dikerjakan", ready_for_review: "Menunggu review",
    revision_required: "Perlu revisi", verified: "Terverifikasi", draft: "Draft", active: "Aktif", completed: "Selesai",
  };
  const colors: Record<string, string> = {
    in_progress: "bg-sky-50 text-sky-900", ready_for_review: "bg-indigo-50 text-indigo-900", revision_required: "bg-amber-50 text-amber-900",
    verified: "bg-green-50 text-green-900", active: "bg-green-50 text-green-900",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colors[value] ?? "bg-muted text-muted-foreground"}`}>
    {labels[value] ?? value}
  </span>;
}
