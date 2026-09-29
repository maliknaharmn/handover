import { requireAdmin } from "@/lib/handover/context";
import { Field, Feedback, Panel, Empty, SelectField } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { createTemplate, createTemplateItem, updateTemplateItem } from "../../admin-actions";

export default async function Templates({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { supabase, org } = await requireAdmin(slug);
  const [feedback, templates, items] = await Promise.all([
    searchParams,
    supabase.from("checklist_templates").select("id,name,is_active").eq("organization_id", org.id).order("name"),
    supabase.from("checklist_template_items").select("id,template_id,category_name,title,description,is_required").eq("organization_id", org.id).order("sort_order"),
  ]);
  return <div className="space-y-6"><Feedback {...feedback} />
    <Panel title="Buat template checklist"><form action={createTemplate.bind(null, slug)} className="flex max-w-xl flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1"><Field label="Nama template" name="name" required minLength={2} /></div>
      <SubmitButton>Buat template</SubmitButton></form></Panel>
    <Panel title="Tambah item template"><form action={createTemplateItem.bind(null, slug)} className="grid max-w-xl gap-4">
      <SelectField label="Template" name="template_id" options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
      <SelectField label="Kategori" name="category_name" options={["Accounts","Documents","Programs","Stakeholders","Tasks"].map((name) => ({ value: name, label: name }))} />
      <Field label="Judul item" name="title" required minLength={2} />
      <Field label="Deskripsi awal" name="description" />
      <label className="flex gap-2 text-sm"><input type="checkbox" name="is_required" defaultChecked />Item wajib</label>
      <SubmitButton>Tambah item</SubmitButton></form></Panel>
    <Panel title="Template tersedia">{templates.data?.length ? <div className="space-y-5">{templates.data.map((t) =>
      <div key={t.id} className="border-b pb-4"><h3 className="font-semibold">{t.name}</h3>
        <ul className="mt-2 space-y-1 text-sm">{(items.data ?? []).filter((item) => item.template_id === t.id).map((item) =>
          <li key={item.id} className="border-t py-2">{item.category_name} · {item.title}{item.is_required ? " · Wajib" : ""}
            <details className="mt-1"><summary className="cursor-pointer text-primary">Ubah item template</summary>
              <form action={updateTemplateItem.bind(null,slug)} className="mt-3 grid max-w-xl gap-3"><input type="hidden" name="id" value={item.id} />
                <SelectField label="Kategori" name="category_name" defaultValue={item.category_name} options={["Accounts","Documents","Programs","Stakeholders","Tasks"].map((name) => ({ value: name, label: name }))} />
                <Field label="Judul" name="title" defaultValue={item.title} required />
                <Field label="Deskripsi awal" name="description" defaultValue={item.description} />
                <label className="flex items-center gap-2"><input type="checkbox" name="is_required" defaultChecked={item.is_required} />Wajib</label>
                <button className="min-h-10 w-fit rounded-full border border-primary px-4 text-primary">Simpan item template</button>
              </form></details>
          </li>)}</ul>
      </div>)}</div> : <Empty text="Belum ada template checklist." />}</Panel>
  </div>;
}
