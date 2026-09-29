create function public.guard_business_row() returns trigger language plpgsql set search_path = '' as $$
declare v_handover public.handovers%rowtype;
begin
  if tg_op = 'UPDATE' then
    if to_jsonb(new)->>'organization_id' is distinct from to_jsonb(old)->>'organization_id'
      or to_jsonb(new)->>'id' is distinct from to_jsonb(old)->>'id' then
      raise exception 'Identitas baris tidak dapat diubah';
    end if;
    if tg_table_name = 'handovers' then
      if old.status <> 'draft'
        and (new.from_period_id is distinct from old.from_period_id or new.to_period_id is distinct from old.to_period_id) then
        raise exception 'Periode handover aktif tidak dapat diganti';
      end if;
    end if;
    if tg_table_name = 'handover_assignments' then
      if new.handover_id is distinct from old.handover_id
        or new.position_id is distinct from old.position_id then
        raise exception 'Posisi atau handover assignment tidak dapat diganti';
      end if;
    end if;
  end if;
  if tg_table_name = 'handover_items' and tg_op = 'INSERT' then
    select * into v_handover from public.handovers where id = new.handover_id and organization_id = new.organization_id;
    if v_handover.status = 'completed' then raise exception 'Handover telah selesai'; end if;
    if new.status <> 'not_started' or new.version <> 1 or new.verified_by is not null or new.verified_at is not null
      or new.submitted_at is not null or not new.is_active then
      raise exception 'Item baru harus dimulai sebagai draft aktif';
    end if;
    if (new.title || ' ' || new.description || ' ' || new.notes || ' ' || new.details::text) ~*
      '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
      raise exception 'Jangan simpan rahasia dalam item';
    end if;
  end if;
  if tg_table_name = 'handover_assignments' then
    select * into v_handover from public.handovers where id = new.handover_id and organization_id = new.organization_id;
    if v_handover.status = 'completed' then raise exception 'Handover telah selesai'; end if;
    if tg_op = 'UPDATE' then
      if v_handover.status = 'active'
        and (new.outgoing_user_id is distinct from old.outgoing_user_id or new.incoming_user_id is distinct from old.incoming_user_id)
        and current_setting('app.assignment_transition', true) is distinct from 'allowed' then
        raise exception 'Gunakan penugasan ulang resmi untuk handover aktif';
      end if;
    end if;
  end if;
  if tg_table_name = 'positions' and tg_op = 'UPDATE' then
    if old.is_active and not new.is_active
      and exists (select 1 from public.handover_assignments a join public.handovers h on h.id = a.handover_id
        where a.position_id = old.id and h.status = 'active') then
      raise exception 'Posisi pada handover aktif tidak dapat dinonaktifkan';
    end if;
  end if;
  return new;
end; $$;
do $$ declare t text; begin
  foreach t in array array['periods','positions','handovers','handover_assignments','handover_categories','checklist_templates','checklist_template_items','handover_items'] loop
    execute format('create trigger guard_%I before insert or update on public.%I for each row execute function public.guard_business_row()', t, t);
  end loop;
end $$;

create function public.guard_position_assignment() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and exists (
    select 1 from public.handover_assignments a join public.handovers h on h.id = a.handover_id
    where a.organization_id = old.organization_id and a.position_id = old.position_id
      and ((h.from_period_id = old.period_id and a.outgoing_user_id = old.user_id)
        or (h.to_period_id = old.period_id and a.incoming_user_id = old.user_id))
  ) then raise exception 'Penempatan sedang dipakai handover'; end if;
  return old;
end; $$;
create trigger guard_position_assignment before delete on public.position_assignments
for each row execute function public.guard_position_assignment();

create function public.initialize_handover() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.handover_categories(organization_id,handover_id,name,sort_order)
  select new.organization_id,new.id,c.name,c.ord
  from unnest(array['Accounts','Documents','Programs','Stakeholders','Tasks']) with ordinality as c(name,ord);
  return new;
end; $$;
create trigger initialize_handover after insert on public.handovers for each row execute function public.initialize_handover();

create function public.notify_item(p_item public.handover_items, p_user uuid, p_event text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_user is null then return; end if;
  if not exists (select 1 from public.organization_members where organization_id = p_item.organization_id and user_id = p_user and is_active) then return; end if;
  insert into public.notifications(organization_id, recipient_id, handover_id, item_id, event_type, message, dedupe_key)
  values (p_item.organization_id, p_user, p_item.handover_id, p_item.id, p_event, p_message,
    p_item.id::text || ':' || p_event || ':' || p_item.version::text || ':' || p_user::text)
  on conflict (dedupe_key) do nothing;
end; $$;
revoke all on function public.notify_item(public.handover_items,uuid,text,text) from public, anon, authenticated;

create function public.item_created_notice() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_a public.handover_assignments%rowtype;
begin
  select * into v_a from public.handover_assignments where id = new.assignment_id;
  perform public.notify_item(new,v_a.outgoing_user_id,'assigned','Item baru ditugaskan');
  perform public.notify_item(new,v_a.incoming_user_id,'assigned','Item baru ditugaskan');
  return new;
end; $$;
create trigger item_created_notice after insert on public.handover_items for each row execute function public.item_created_notice();

create function public.change_item(p_item_id uuid, p_version integer, p_action text, p_payload jsonb default '{}'::jsonb)
returns public.handover_items language plpgsql security definer set search_path = '' as $$
declare v_item public.handover_items%rowtype; v_assignment public.handover_assignments%rowtype;
  v_handover public.handovers%rowtype; v_category text; v_reason text; v_old_status text; v_admin boolean;
  v_url text; v_title text; v_desc text; v_details jsonb;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  select * into v_item from public.handover_items where id = p_item_id for update;
  if not found or not public.is_member(v_item.organization_id) then raise exception 'Item tidak ditemukan'; end if;
  if v_item.version <> p_version then raise exception 'CONFLICT: item telah berubah, muat ulang'; end if;
  select * into v_handover from public.handovers where id = v_item.handover_id;
  select * into v_assignment from public.handover_assignments where id = v_item.assignment_id;
  select name into v_category from public.handover_categories where id = v_item.category_id;
  if v_handover.status <> 'active' or not v_item.is_active then raise exception 'Item tidak dapat diubah pada handover ini'; end if;
  v_admin := public.is_admin(v_item.organization_id);
  v_old_status := v_item.status;

  if p_action in ('save','admin_correct') then
    if v_item.status not in ('not_started','in_progress','revision_required') then
      raise exception 'Item dalam review atau verified tidak dapat diedit'; end if;
    if p_action = 'save' and v_assignment.outgoing_user_id <> auth.uid() then
      raise exception 'Hanya penyerah dapat mengubah draft atau revisi'; end if;
    if p_action = 'admin_correct' then
      v_reason := btrim(coalesce(p_payload->>'reason',''));
      if not v_admin or pg_catalog.length(v_reason) < 5 then raise exception 'Koreksi admin memerlukan alasan'; end if;
      if v_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
        raise exception 'Jangan tulis rahasia dalam alasan'; end if;
    end if;
    if jsonb_typeof(p_payload) <> 'object' or pg_catalog.length(p_payload::text) > 20000 then raise exception 'Data item tidak valid'; end if;
    v_url := case when p_payload ? 'reference_url' then nullif(btrim(p_payload->>'reference_url'),'') else v_item.reference_url end;
    if v_url is not null and (v_url !~ '^https://[^[:space:]]+$' or v_url ~* '(token|key|secret|password|auth)=') then
      raise exception 'URL referensi harus HTTPS tanpa token atau rahasia';
    end if;
    v_title := case when p_payload ? 'title' then btrim(p_payload->>'title') else v_item.title end;
    v_desc := case when p_payload ? 'description' then btrim(p_payload->>'description') else v_item.description end;
    v_details := case when p_payload ? 'details' then p_payload->'details' else v_item.details end;
    if pg_catalog.length(v_title) > 200 or pg_catalog.length(v_desc) > 8000 or jsonb_typeof(v_details) <> 'object' then
      raise exception 'Konten item tidak valid';
    end if;
    if (v_title || ' ' || v_desc || ' ' || coalesce(p_payload->>'notes',v_item.notes) || ' ' || v_details::text) ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
      raise exception 'Jangan simpan password, recovery code, atau API key';
    end if;
    update public.handover_items set title = v_title, description = v_desc,
      notes = case when p_payload ? 'notes' then left(btrim(p_payload->>'notes'),8000) else notes end,
      details = v_details,
      reference_label = case when p_payload ? 'reference_label' then nullif(left(btrim(p_payload->>'reference_label'),200),'') else reference_label end,
      reference_url = v_url, status = 'in_progress', version = version + 1
    where id = p_item_id returning * into v_item;
  elsif p_action = 'submit' then
    if v_assignment.outgoing_user_id <> auth.uid() or v_item.status <> 'in_progress' then raise exception 'Item belum siap dikirim'; end if;
    if not exists (select 1 from public.organization_members m where m.organization_id = v_item.organization_id
      and m.user_id = v_assignment.incoming_user_id and m.is_active and 'incoming' = any(m.roles)) then
      raise exception 'Penerima harus aktif dan memiliki role incoming';
    end if;
    if pg_catalog.length(btrim(v_item.title)) < 2 or
      (pg_catalog.length(btrim(v_item.description)) < 10 and v_item.reference_url is null) then
      raise exception 'Judul dan isi atau referensi belum cukup untuk review';
    end if;
    if v_category = 'Accounts' and (coalesce(v_item.details->>'asset_type','') = '' or coalesce(v_item.details->>'transfer_status','') = '') then
      raise exception 'Akun memerlukan jenis aset dan status transfer'; end if;
    if v_category = 'Documents' and coalesce(v_item.details->>'owner','') = '' then
      raise exception 'Dokumen memerlukan owner'; end if;
    if v_category = 'Programs' and coalesce(v_item.details->>'goal','') = '' then
      raise exception 'Program memerlukan tujuan'; end if;
    if v_category = 'Stakeholders' and (coalesce(v_item.details->>'name','') = '' or coalesce(v_item.details->>'context','') = '') then
      raise exception 'Stakeholder memerlukan nama dan konteks relasi'; end if;
    if v_category = 'Tasks' and coalesce(v_item.details->>'owner','') = '' then
      raise exception 'Tugas memerlukan owner'; end if;
    update public.handover_items set status = 'ready_for_review', submitted_at = now(), version = version + 1
    where id = p_item_id returning * into v_item;
    perform public.notify_item(v_item,v_assignment.incoming_user_id,'ready_for_review','Item siap direview');
  elsif p_action in ('verify','revise') then
    if v_item.status <> 'ready_for_review' or v_assignment.outgoing_user_id = auth.uid()
      or (v_assignment.incoming_user_id <> auth.uid() and not v_admin) then
      raise exception 'Anda tidak berhak mengambil keputusan review';
    end if;
    v_reason := btrim(coalesce(p_payload->>'reason',''));
    if p_action = 'revise' and (pg_catalog.length(v_reason) < 5 or pg_catalog.length(v_reason) > 4000) then
      raise exception 'Alasan revisi wajib diisi (5–4000 karakter)'; end if;
    if v_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
      raise exception 'Jangan tulis rahasia dalam alasan'; end if;
    update public.handover_items set status = case when p_action = 'verify' then 'verified' else 'revision_required' end,
      verified_by = case when p_action = 'verify' then auth.uid() else null end,
      verified_at = case when p_action = 'verify' then now() else null end,
      version = version + 1 where id = p_item_id returning * into v_item;
    if p_action = 'revise' then
      insert into public.handover_item_comments(organization_id,handover_id,item_id,author_id,body,is_revision_reason)
      values (v_item.organization_id,v_item.handover_id,v_item.id,auth.uid(),v_reason,true);
      perform public.notify_item(v_item,v_assignment.outgoing_user_id,'revision_required','Revisi item diminta');
    else
      perform public.notify_item(v_item,v_assignment.outgoing_user_id,'verified','Item telah diverifikasi');
      perform public.notify_item(v_item,v_assignment.incoming_user_id,'verified','Item telah diverifikasi');
    end if;
  elsif p_action = 'reopen' then
    v_reason := btrim(coalesce(p_payload->>'reason',''));
    if not v_admin or v_item.status <> 'verified' or pg_catalog.length(v_reason) < 5 then
      raise exception 'Admin harus memberi alasan untuk membuka ulang item verified'; end if;
    if v_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
      raise exception 'Jangan tulis rahasia dalam alasan'; end if;
    update public.handover_items set status = 'in_progress', verified_by = null, verified_at = null,
      version = version + 1 where id = p_item_id returning * into v_item;
    perform public.notify_item(v_item,v_assignment.outgoing_user_id,'reopened','Item dibuka kembali');
  elsif p_action = 'comment' then
    v_reason := btrim(coalesce(p_payload->>'body',''));
    if pg_catalog.length(v_reason) < 1 or pg_catalog.length(v_reason) > 4000 or
      (not v_admin and v_assignment.outgoing_user_id <> auth.uid() and v_assignment.incoming_user_id <> auth.uid()) then
      raise exception 'Komentar tidak diizinkan'; end if;
    if v_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
      raise exception 'Jangan simpan rahasia dalam komentar'; end if;
    insert into public.handover_item_comments(organization_id,handover_id,item_id,author_id,body)
      values (v_item.organization_id,v_item.handover_id,v_item.id,auth.uid(),v_reason);
    insert into public.activity_logs(organization_id,handover_id,item_id,actor_id,event_type,summary)
      values (v_item.organization_id,v_item.handover_id,v_item.id,auth.uid(),'item.comment','Komentar ditambahkan');
    return v_item;
  else raise exception 'Aksi item tidak dikenal';
  end if;
  insert into public.activity_logs(organization_id,handover_id,item_id,actor_id,event_type,summary,old_status,new_status,reason)
  values (v_item.organization_id,v_item.handover_id,v_item.id,auth.uid(),'item.' || p_action,
    case when v_admin and p_action in ('verify','revise') then 'Keputusan review oleh admin' else 'Item ' || p_action end,
    v_old_status,v_item.status,case when p_action in ('reopen','admin_correct') then v_reason else null end);
  return v_item;
end; $$;

create function public.change_handover(p_handover_id uuid, p_action text, p_reason text default null)
returns public.handovers language plpgsql security definer set search_path = '' as $$
declare v_h public.handovers%rowtype; v_count integer; v_bad integer; v_old text;
begin
  select * into v_h from public.handovers where id = p_handover_id for update;
  if not found or not public.is_admin(v_h.organization_id) then raise exception 'Handover tidak ditemukan atau akses ditolak'; end if;
  v_old := v_h.status;
  if p_action = 'activate' and v_h.status = 'draft' then
    select count(*) filter (where i.is_required), count(*) filter (where not exists (
      select 1 from public.handover_assignments a
      join public.organization_members o on o.organization_id = a.organization_id and o.user_id = a.outgoing_user_id and o.is_active and 'outgoing' = any(o.roles)
      join public.organization_members n on n.organization_id = a.organization_id and n.user_id = a.incoming_user_id and n.is_active and 'incoming' = any(n.roles)
      join public.position_assignments pa on pa.organization_id = a.organization_id and pa.period_id = v_h.from_period_id and pa.position_id = a.position_id and pa.user_id = a.outgoing_user_id
      join public.position_assignments pb on pb.organization_id = a.organization_id and pb.period_id = v_h.to_period_id and pb.position_id = a.position_id and pb.user_id = a.incoming_user_id
      where a.id = i.assignment_id and a.outgoing_user_id <> a.incoming_user_id
    )) into v_count, v_bad from public.handover_items i
    where i.handover_id = v_h.id and i.is_active;
    if v_count = 0 or v_bad > 0 then raise exception 'Butuh item wajib dan semua item aktif harus memiliki pasangan penyerah serta penerima aktif'; end if;
    perform pg_catalog.set_config('app.handover_transition','allowed',true);
    update public.handovers set status = 'active', activated_at = now(), completed_at = null where id = v_h.id returning * into v_h;
  elsif p_action = 'complete' and v_h.status = 'active' then
    select count(*), count(*) filter (where status <> 'verified') into v_count,v_bad
      from public.handover_items where handover_id = v_h.id and is_active and is_required;
    if v_count = 0 or v_bad > 0 then raise exception 'Semua item wajib harus diverifikasi sebelum ditutup'; end if;
    perform pg_catalog.set_config('app.handover_transition','allowed',true);
    update public.handovers set status = 'completed', completed_at = now() where id = v_h.id returning * into v_h;
  elsif p_action = 'reopen' and v_h.status = 'completed' and pg_catalog.length(btrim(coalesce(p_reason,''))) >= 5 then
    perform pg_catalog.set_config('app.handover_transition','allowed',true);
    update public.handovers set status = 'active', completed_at = null where id = v_h.id returning * into v_h;
  else raise exception 'Transisi handover atau alasan tidak valid'; end if;
  if p_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
    raise exception 'Jangan tulis rahasia dalam alasan'; end if;
  insert into public.activity_logs(organization_id,handover_id,actor_id,event_type,summary,old_status,new_status,reason)
  values (v_h.organization_id,v_h.id,auth.uid(),'handover.'||p_action,'Handover '||p_action,v_old,v_h.status,
    case when p_action = 'reopen' then btrim(p_reason) else null end);
  return v_h;
end; $$;

create function public.configure_item(p_item_id uuid, p_version integer, p_assignment_id uuid,
  p_category_id uuid, p_required boolean, p_active boolean, p_due_on date, p_reason text)
returns public.handover_items language plpgsql security definer set search_path = '' as $$
declare v_item public.handover_items%rowtype; v_h public.handovers%rowtype; v_old text; v_old_assignment uuid;
begin
  select * into v_item from public.handover_items where id = p_item_id for update;
  if not found or not public.is_admin(v_item.organization_id) then raise exception 'Akses ditolak'; end if;
  if v_item.version <> p_version then raise exception 'CONFLICT: item telah berubah, muat ulang'; end if;
  select * into v_h from public.handovers where id = v_item.handover_id;
  if v_h.status = 'completed' then raise exception 'Handover telah selesai'; end if;
  if v_h.status = 'active' and pg_catalog.length(btrim(coalesce(p_reason,''))) < 5 then
    raise exception 'Alasan perubahan pada handover aktif wajib diisi'; end if;
  if p_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
    raise exception 'Jangan tulis rahasia dalam alasan'; end if;
  if v_item.status = 'verified' and not p_active then raise exception 'Buka ulang item verified sebelum menonaktifkannya'; end if;
  if v_item.status = 'verified' and p_assignment_id <> v_item.assignment_id then
    raise exception 'Buka ulang item verified sebelum mengganti penerima'; end if;
  if not exists (select 1 from public.handover_assignments where id = p_assignment_id and handover_id = v_item.handover_id) or
     not exists (select 1 from public.handover_categories where id = p_category_id and handover_id = v_item.handover_id) then
    raise exception 'Assignment atau kategori tidak sesuai handover'; end if;
  v_old := v_item.status;
  v_old_assignment := v_item.assignment_id;
  update public.handover_items set assignment_id = p_assignment_id, category_id = p_category_id,
    is_required = p_required, is_active = p_active, due_on = p_due_on,
    status = case when p_assignment_id <> assignment_id
      and status = 'ready_for_review' then 'in_progress' else status end,
    submitted_at = case when p_assignment_id <> assignment_id and status = 'ready_for_review'
      then null else submitted_at end,
    version = version + 1 where id = p_item_id returning * into v_item;
  insert into public.activity_logs(organization_id,handover_id,item_id,actor_id,event_type,summary,old_status,new_status,reason)
  values (v_item.organization_id,v_item.handover_id,v_item.id,auth.uid(),'item.configure',
    'Metadata atau penugasan item diubah',v_old,v_item.status,nullif(btrim(coalesce(p_reason,'')),''));
  if p_assignment_id <> v_old_assignment then
    perform public.notify_item(v_item,(select outgoing_user_id from public.handover_assignments where id = p_assignment_id),'assigned','Penugasan item berubah');
    perform public.notify_item(v_item,(select incoming_user_id from public.handover_assignments where id = p_assignment_id),'assigned','Penugasan item berubah');
  end if;
  return v_item;
end; $$;

create function public.reassign_handover_position(p_assignment_id uuid, p_outgoing uuid, p_incoming uuid, p_reason text)
returns public.handover_assignments language plpgsql security definer set search_path = '' as $$
declare v_a public.handover_assignments%rowtype; v_h public.handovers%rowtype; v_item public.handover_items%rowtype; v_old_status text;
begin
  select * into v_a from public.handover_assignments where id = p_assignment_id for update;
  if not found or not public.is_admin(v_a.organization_id) then raise exception 'Penugasan tidak ditemukan'; end if;
  select * into v_h from public.handovers where id = v_a.handover_id for update;
  if v_h.status = 'completed' then raise exception 'Handover telah selesai'; end if;
  if p_outgoing = p_incoming or pg_catalog.length(btrim(coalesce(p_reason,''))) < 5 then
    raise exception 'Penyerah/penerima harus berbeda dan alasan wajib diisi'; end if;
  if p_outgoing = v_a.outgoing_user_id and p_incoming = v_a.incoming_user_id then
    raise exception 'Pasangan tidak berubah'; end if;
  if p_reason ~* '((password|recovery[ _-]?code|api[_ -]?key|access[_ -]?token|client[_ -]?secret)["[:space:]]*[:=])' then
    raise exception 'Jangan tulis rahasia dalam alasan'; end if;
  if not exists (select 1 from public.position_assignments pa join public.organization_members m
    on m.organization_id = pa.organization_id and m.user_id = pa.user_id and m.is_active and 'outgoing' = any(m.roles)
    where pa.organization_id = v_a.organization_id and pa.period_id = v_h.from_period_id and pa.position_id = v_a.position_id and pa.user_id = p_outgoing)
    or not exists (select 1 from public.position_assignments pa join public.organization_members m
    on m.organization_id = pa.organization_id and m.user_id = pa.user_id and m.is_active and 'incoming' = any(m.roles)
    where pa.organization_id = v_a.organization_id and pa.period_id = v_h.to_period_id and pa.position_id = v_a.position_id and pa.user_id = p_incoming) then
    raise exception 'Pengganti harus aktif dan ditempatkan pada posisi serta periode yang tepat'; end if;
  if exists (select 1 from public.handover_items where assignment_id = v_a.id and is_active and status = 'verified') then
    raise exception 'Buka ulang item verified sebelum mengganti pasangan'; end if;
  perform pg_catalog.set_config('app.assignment_transition','allowed',true);
  update public.handover_assignments set outgoing_user_id = p_outgoing, incoming_user_id = p_incoming
    where id = v_a.id returning * into v_a;
  for v_item in select * from public.handover_items where assignment_id = v_a.id and is_active for update loop
    v_old_status := v_item.status;
    update public.handover_items set status = case when status = 'ready_for_review' then 'in_progress' else status end,
      submitted_at = case when status = 'ready_for_review' then null else submitted_at end, version = version + 1
      where id = v_item.id returning * into v_item;
    if v_old_status = 'ready_for_review' then
      insert into public.activity_logs(organization_id,handover_id,item_id,actor_id,event_type,summary,old_status,new_status,reason)
      values (v_a.organization_id,v_a.handover_id,v_item.id,auth.uid(),'item.reassigned','Reviewer item diganti',
        'ready_for_review','in_progress',btrim(p_reason));
    end if;
    perform public.notify_item(v_item,p_outgoing,'assigned','Penugasan item berubah');
    perform public.notify_item(v_item,p_incoming,'assigned','Penugasan item berubah');
  end loop;
  insert into public.activity_logs(organization_id,handover_id,actor_id,event_type,summary,reason)
  values (v_a.organization_id,v_a.handover_id,auth.uid(),'handover.assignment_reassigned','Pasangan penyerah dan penerima diganti',btrim(p_reason));
  return v_a;
end; $$;

create function public.apply_template(p_template_id uuid, p_assignment_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_t public.checklist_templates%rowtype; v_a public.handover_assignments%rowtype; v_h public.handovers%rowtype;
  v_i public.checklist_template_items%rowtype; v_cat uuid; v_count integer := 0;
begin
  select * into v_t from public.checklist_templates where id = p_template_id;
  select * into v_a from public.handover_assignments where id = p_assignment_id;
  if not found or v_t.organization_id <> v_a.organization_id or not public.is_admin(v_t.organization_id) or not v_t.is_active then
    raise exception 'Template atau penugasan tidak valid'; end if;
  select * into v_h from public.handovers where id = v_a.handover_id;
  if v_h.status <> 'draft' then raise exception 'Template hanya dapat diterapkan pada draft'; end if;
  for v_i in select * from public.checklist_template_items where template_id = v_t.id order by sort_order,id loop
    insert into public.handover_categories(organization_id,handover_id,name)
    values (v_a.organization_id,v_a.handover_id,v_i.category_name)
    on conflict (organization_id,handover_id,name) do nothing;
    select id into v_cat from public.handover_categories
      where organization_id = v_a.organization_id and handover_id = v_a.handover_id and name = v_i.category_name;
    insert into public.handover_items(organization_id,handover_id,assignment_id,category_id,title,description,is_required)
    values (v_a.organization_id,v_a.handover_id,v_a.id,v_cat,v_i.title,v_i.description,v_i.is_required);
    v_count := v_count + 1;
  end loop;
  return v_count;
end; $$;

create function public.due_notifications(p_organization_id uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_item public.handover_items%rowtype; v_outgoing uuid; v_count integer := 0; v_event text; v_day date;
begin
  if not public.is_admin(p_organization_id) and auth.role() <> 'service_role' then raise exception 'Akses ditolak'; end if;
  select (now() at time zone o.timezone)::date into v_day from public.organizations o where id = p_organization_id;
  for v_item in select i.* from public.handover_items i join public.handovers h on h.id = i.handover_id
    where i.organization_id = p_organization_id and h.status = 'active' and i.is_active and i.is_required
      and i.status <> 'verified' and i.due_on <= v_day + 3 loop
    select outgoing_user_id into v_outgoing from public.handover_assignments where id = v_item.assignment_id;
    v_event := case when v_item.due_on < v_day then 'overdue' else 'due_soon' end;
    insert into public.notifications(organization_id,recipient_id,handover_id,item_id,event_type,message,dedupe_key)
    select v_item.organization_id,v_outgoing,v_item.handover_id,v_item.id,v_event,
      case when v_event = 'overdue' then 'Item melewati tenggat' else 'Tenggat item mendekat' end,
      v_item.id::text || ':' || v_event || ':' || v_outgoing::text
    where exists (select 1 from public.organization_members where organization_id = v_item.organization_id and user_id = v_outgoing and is_active)
    on conflict (dedupe_key) do nothing;
    v_count := v_count + 1;
  end loop;
  return v_count;
end; $$;

create function public.search_items(p_organization_id uuid, p_handover_id uuid default null,
  p_query text default '', p_status text default null, p_category_id uuid default null,
  p_position_id uuid default null, p_owner_id uuid default null, p_limit integer default 50, p_offset integer default 0)
returns setof public.handover_items language sql stable security invoker set search_path = '' as $$
  select i.* from public.handover_items i
  join public.handover_categories c on c.id = i.category_id
  join public.handover_assignments a on a.id = i.assignment_id
  join public.positions p on p.id = a.position_id
  where i.organization_id = p_organization_id
    and (p_handover_id is null or i.handover_id = p_handover_id)
    and (p_status is null or i.status = any(string_to_array(p_status,',')))
    and (p_category_id is null or i.category_id = p_category_id)
    and (p_position_id is null or a.position_id = p_position_id)
    and (p_owner_id is null or a.outgoing_user_id = p_owner_id or a.incoming_user_id = p_owner_id)
    and (btrim(p_query) = '' or to_tsvector('simple', coalesce(i.title,'') || ' ' || coalesce(i.description,'') || ' ' || coalesce(i.notes,'') || ' ' ||
      coalesce(i.details->>'name','') || ' ' || coalesce(i.details->>'affiliation','') || ' ' || coalesce(i.details->>'vendor','') || ' ' ||
      c.name || ' ' || p.name) @@ plainto_tsquery('simple', left(p_query, 120)))
  order by i.updated_at desc, i.id desc limit least(greatest(p_limit,1),100) offset least(greatest(p_offset,0),10000);
$$;

create function public.handover_metrics(p_handover_id uuid) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare v_org uuid; v_tz text; v_result jsonb;
begin
  select h.organization_id, o.timezone into v_org, v_tz from public.handovers h
    join public.organizations o on o.id = h.organization_id where h.id = p_handover_id;
  if v_org is null or not public.is_member(v_org) then raise exception 'Handover tidak ditemukan'; end if;
  with source as (
    select i.*, c.name as category_name, p.name as position_name
    from public.handover_items i join public.handover_categories c on c.id = i.category_id
    join public.handover_assignments a on a.id = i.assignment_id
    join public.positions p on p.id = a.position_id
    where i.handover_id = p_handover_id and i.is_active
  ), overall as (
    select count(*) filter (where is_required) as required_total,
      count(*) filter (where is_required and status = 'verified') as required_verified,
      count(*) filter (where status = 'ready_for_review') as waiting_review,
      count(*) filter (where status = 'revision_required') as revision_required,
      count(*) filter (where status = 'in_progress') as in_progress,
      count(*) filter (where status = 'not_started') as not_started,
      count(*) filter (where is_required and status <> 'verified' and due_on < (now() at time zone v_tz)::date) as overdue,
      count(*) filter (where not is_required and status <> 'verified') as optional_outstanding
    from source
  )
  select jsonb_build_object('overall',to_jsonb(overall),
    'categories',coalesce((select jsonb_agg(x) from (select category_name as name,
      count(*) filter (where is_required) as required_total,
      count(*) filter (where is_required and status = 'verified') as required_verified
      from source group by category_name order by category_name) x),'[]'::jsonb),
    'positions',coalesce((select jsonb_agg(x) from (select position_name as name,
      count(*) filter (where is_required) as required_total,
      count(*) filter (where is_required and status = 'verified') as required_verified
      from source group by position_name order by position_name) x),'[]'::jsonb)) into v_result from overall;
  return v_result;
end; $$;

create function public.my_tasks(p_organization_id uuid, p_kind text, p_limit integer default 50, p_offset integer default 0)
returns setof public.handover_items language sql stable security invoker set search_path = '' as $$
  select i.* from public.handover_items i
  join public.handovers h on h.id = i.handover_id and h.status = 'active'
  join public.handover_assignments a on a.id = i.assignment_id
  where i.organization_id = p_organization_id and i.is_active and
    ((p_kind = 'outgoing' and a.outgoing_user_id = auth.uid() and i.status in ('not_started','in_progress','revision_required'))
      or (p_kind = 'incoming' and a.incoming_user_id = auth.uid() and a.outgoing_user_id <> auth.uid() and i.status = 'ready_for_review'))
  order by i.updated_at desc, i.id desc limit least(greatest(p_limit,1),100) offset least(greatest(p_offset,0),10000);
$$;

create function public.my_task_counts(p_organization_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'outgoing',count(*) filter (where a.outgoing_user_id = auth.uid() and i.status in ('not_started','in_progress','revision_required')),
    'incoming',count(*) filter (where a.incoming_user_id = auth.uid() and a.outgoing_user_id <> auth.uid() and i.status = 'ready_for_review'))
  from public.handover_items i
  join public.handovers h on h.id = i.handover_id and h.status = 'active'
  join public.handover_assignments a on a.id = i.assignment_id
  where i.organization_id = p_organization_id and i.is_active;
$$;

revoke all on function public.change_item(uuid,integer,text,jsonb) from public, anon;
revoke all on function public.change_handover(uuid,text,text) from public, anon;
revoke all on function public.configure_item(uuid,integer,uuid,uuid,boolean,boolean,date,text) from public, anon;
revoke all on function public.apply_template(uuid,uuid) from public, anon;
revoke all on function public.reassign_handover_position(uuid,uuid,uuid,text) from public, anon;
revoke all on function public.due_notifications(uuid) from public, anon;
revoke all on function public.search_items(uuid,uuid,text,text,uuid,uuid,uuid,integer,integer) from public, anon;
revoke all on function public.handover_metrics(uuid) from public, anon;
revoke all on function public.my_tasks(uuid,text,integer,integer) from public, anon;
revoke all on function public.my_task_counts(uuid) from public, anon;
grant execute on function public.change_item(uuid,integer,text,jsonb) to authenticated;
grant execute on function public.change_handover(uuid,text,text) to authenticated;
grant execute on function public.configure_item(uuid,integer,uuid,uuid,boolean,boolean,date,text) to authenticated;
grant execute on function public.apply_template(uuid,uuid) to authenticated;
grant execute on function public.reassign_handover_position(uuid,uuid,uuid,text) to authenticated;
grant execute on function public.due_notifications(uuid) to authenticated;
grant execute on function public.due_notifications(uuid) to service_role;
grant execute on function public.search_items(uuid,uuid,text,text,uuid,uuid,uuid,integer,integer) to authenticated;
grant execute on function public.handover_metrics(uuid) to authenticated;
grant execute on function public.my_tasks(uuid,text,integer,integer) to authenticated;
grant execute on function public.my_task_counts(uuid) to authenticated;

-- Column-level grants keep clients from rewriting notification metadata.
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
revoke update on public.organizations from authenticated;
grant update (name,logo_url,timezone) on public.organizations to authenticated;
revoke update on public.organization_members from authenticated;
grant update (roles,is_active) on public.organization_members to authenticated;
revoke update on public.periods from authenticated;
grant update (label,starts_on,ends_on) on public.periods to authenticated;
revoke update on public.positions from authenticated;
grant update (name,division,is_active) on public.positions to authenticated;
revoke update on public.handovers from authenticated;
grant update (from_period_id,to_period_id,due_on) on public.handovers to authenticated;
revoke update on public.handover_assignments from authenticated;
grant update (outgoing_user_id,incoming_user_id) on public.handover_assignments to authenticated;
revoke update on public.handover_categories from authenticated;
grant update (name,sort_order) on public.handover_categories to authenticated;
revoke update on public.checklist_templates from authenticated;
grant update (name,is_active) on public.checklist_templates to authenticated;
revoke update on public.checklist_template_items from authenticated;
grant update (category_name,title,description,is_required,sort_order) on public.checklist_template_items to authenticated;
