"use client";

import { useActionState } from "react";
import { Field, TextArea } from "./ui";
import { SubmitButton } from "./submit-button";
import { saveItemState, type ItemFormState } from "@/app/org/[slug]/handovers/[id]/items/item-actions";

export function ItemEditForm({ slug, handoverId, itemId, version, initialValues, fields, adminCorrection }: {
  slug: string; handoverId: string; itemId: string; version: number; initialValues: Record<string,string>;
  fields: [string,string][]; adminCorrection: boolean;
}) {
  const [state, action] = useActionState(saveItemState.bind(null,slug,handoverId,itemId),
    { error: "", values: initialValues, revision: 0 } satisfies ItemFormState);
  const values = state.values;
  return <form key={state.revision} action={action} className="grid gap-5">
    {state.error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-red-50 p-3 text-sm text-destructive">
      Perubahan belum tersimpan: {state.error} Periksa isian atau muat ulang jika item telah berubah.
    </p> : null}
    <input type="hidden" name="version" value={version} />
    {adminCorrection ? <input type="hidden" name="mode" value="admin_correct" /> : null}
    <Field label="Judul" name="title" required defaultValue={values.title} maxLength={200} />
    <TextArea label="Deskripsi dan konteks" name="description" defaultValue={values.description} />
    <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">{fields.map(([key,label]) =>
      <Field key={key} label={label} name={key} defaultValue={values[key] ?? ""} />)}</div>
    <div className="grid gap-4 border-t pt-4 sm:grid-cols-2"><Field label="Label referensi" name="reference_label" defaultValue={values.reference_label} />
      <Field label="URL referensi (HTTPS)" name="reference_url" type="url" defaultValue={values.reference_url} /></div>
    <TextArea label="Catatan untuk penerima" name="notes" defaultValue={values.notes} />
    {adminCorrection ? <TextArea label="Alasan koreksi admin" name="reason" rows={2} required defaultValue={values.reason} /> : null}
    <div><SubmitButton variant={adminCorrection ? "primary" : "secondary"}>{adminCorrection ? "Simpan koreksi" : "Simpan draft"}</SubmitButton></div>
  </form>;
}
