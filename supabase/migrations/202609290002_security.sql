-- Tenant isolation and controlled mutations. Definer helpers do not expose rows.
create function public.is_member(p_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id and m.user_id = (select auth.uid()) and m.is_active
  );
$$;
create function public.is_admin(p_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id and m.user_id = (select auth.uid()) and m.is_active and 'admin' = any(m.roles)
  );
$$;
create function public.shares_org(p_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid()) and mine.is_active and theirs.user_id = p_user_id and theirs.is_active
  );
$$;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.shares_org(uuid) to authenticated;

create function public.new_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', '')) on conflict (id) do nothing;
  return new;
end; $$;
create trigger auth_user_profile after insert on auth.users for each row execute function public.new_profile();
insert into public.profiles(id, display_name)
select id, coalesce(raw_user_meta_data->>'full_name', '') from auth.users on conflict (id) do nothing;

create function public.snapshot_actor_label() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_label text;
begin
  if tg_table_name = 'activity_logs' then
    select coalesce(nullif(btrim(display_name),''),'Anggota') into v_label
    from public.profiles where id = new.actor_id;
    new.actor_label := coalesce(v_label, case when new.actor_id is null then 'Sistem' else 'Anggota' end);
  else
    select coalesce(nullif(btrim(display_name),''),'Anggota') into v_label
    from public.profiles where id = new.author_id;
    new.author_label := coalesce(v_label,'Anggota');
  end if;
  return new;
end; $$;
create trigger snapshot_activity_actor before insert on public.activity_logs
for each row execute function public.snapshot_actor_label();
create trigger snapshot_comment_author before insert on public.handover_item_comments
for each row execute function public.snapshot_actor_label();

-- A project owner seeds the allowlist email once. Auth signup remains disabled.
create table public.bootstrap_allowlist (email text primary key check (email = lower(btrim(email))));
alter table public.bootstrap_allowlist enable row level security;
revoke all on public.bootstrap_allowlist from anon, authenticated;

create function public.bootstrap_kodisia() returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_email text; v_org uuid;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email = '' or not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null and lower(email) = v_email) then
    raise exception 'Email terverifikasi diperlukan';
  end if;
  if not exists (select 1 from public.bootstrap_allowlist where email = v_email) then
    raise exception 'Akun ini belum disetujui sebagai admin awal';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(73920260929);
  if exists (select 1 from public.organizations where slug = 'kodisia') then
    raise exception 'Workspace KODISIA sudah dibuat';
  end if;
  insert into public.organizations(slug, name) values ('kodisia','KODISIA') returning id into v_org;
  insert into public.organization_members(organization_id, user_id, roles) values (v_org, auth.uid(), array['admin']::text[]);
  insert into public.activity_logs(organization_id, actor_id, event_type, summary)
  values (v_org, auth.uid(), 'organization.created', 'Workspace KODISIA dibuat');
  return v_org;
end; $$;

create function public.accept_invitation() returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_email text; v_inv public.organization_invitations%rowtype;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email = '' or not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null and lower(email) = v_email) then
    raise exception 'Email terverifikasi diperlukan';
  end if;
  select * into v_inv from public.organization_invitations
  where email = v_email and status = 'pending' and expires_at > now()
  order by created_at desc limit 1 for update;
  if not found then raise exception 'Undangan tidak ditemukan atau kedaluwarsa'; end if;
  if exists (select 1 from public.organization_members where organization_id = v_inv.organization_id and user_id = auth.uid()) then
    raise exception 'Keanggotaan sudah ada; hubungi admin untuk perubahan akses';
  end if;
  insert into public.organization_members(organization_id, user_id, roles)
  values (v_inv.organization_id, auth.uid(), v_inv.roles);
  update public.organization_invitations set status = 'accepted', accepted_at = now() where id = v_inv.id;
  insert into public.activity_logs(organization_id, actor_id, event_type, summary)
  values (v_inv.organization_id, auth.uid(), 'invitation.accepted', 'Undangan anggota diterima');
  return v_inv.organization_id;
end; $$;

create function public.guard_last_admin() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.is_active and 'admin' = any(old.roles) and (not new.is_active or not ('admin' = any(new.roles))) then
    if not exists (select 1 from public.organization_members m where m.organization_id = old.organization_id
      and m.user_id <> old.user_id and m.is_active and 'admin' = any(m.roles)) then
      raise exception 'Admin aktif terakhir tidak dapat dinonaktifkan';
    end if;
  end if;
  if old.is_active and (not new.is_active or ('outgoing' = any(old.roles) and not ('outgoing' = any(new.roles)))
    or ('incoming' = any(old.roles) and not ('incoming' = any(new.roles)))) and exists (
    select 1 from public.handover_items i
    join public.handover_assignments a on a.id = i.assignment_id
    join public.handovers h on h.id = i.handover_id
    where i.organization_id = old.organization_id and h.status = 'active' and i.is_active
      and i.status <> 'verified' and (a.outgoing_user_id = old.user_id or a.incoming_user_id = old.user_id)
  ) then raise exception 'Pindahkan item terbuka sebelum menonaktifkan anggota'; end if;
  return new;
end; $$;
create trigger guard_last_admin before update on public.organization_members
for each row execute function public.guard_last_admin();

create function public.guard_handover_status() returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status is distinct from new.status and current_setting('app.handover_transition', true) is distinct from 'allowed' then
    raise exception 'Gunakan transisi handover resmi';
  end if;
  return new;
end; $$;
create trigger guard_handover_status before update on public.handovers for each row execute function public.guard_handover_status();

create function public.audit_admin_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_org uuid; v_handover uuid; v_item uuid; v_subject text;
begin
  v_org := case when tg_table_name = 'organizations' then coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid)
    else coalesce((to_jsonb(new)->>'organization_id')::uuid, (to_jsonb(old)->>'organization_id')::uuid) end;
  v_handover := case when tg_table_name = 'handovers' then coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid)
    else nullif(coalesce(to_jsonb(new)->>'handover_id', to_jsonb(old)->>'handover_id'), '')::uuid end;
  if tg_table_name = 'handover_items' then v_item := new.id; end if;
  v_subject := coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'user_id',to_jsonb(old)->>'user_id');
  insert into public.activity_logs(organization_id, handover_id, item_id, subject_type, subject_id, actor_id, event_type, summary)
  values (v_org, v_handover, v_item, tg_table_name, v_subject, auth.uid(), tg_table_name || '.' || lower(tg_op),
    case tg_op when 'INSERT' then 'Data ' || tg_table_name || ' ditambahkan'
      when 'UPDATE' then 'Data ' || tg_table_name || ' diubah'
      else 'Data ' || tg_table_name || ' dihapus' end);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
do $$ declare t text; begin
  foreach t in array array['organization_members','organization_invitations','periods','positions','position_assignments','handovers','handover_assignments','handover_categories','checklist_templates','checklist_template_items'] loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.audit_admin_change()', t, t);
  end loop;
end $$;
create trigger audit_organizations after update on public.organizations
for each row execute function public.audit_admin_change();
create trigger audit_item_created after insert on public.handover_items
for each row execute function public.audit_admin_change();

do $$ declare t text; begin
  foreach t in array array['profiles','organizations','organization_members','organization_invitations','periods','positions','position_assignments','handovers','handover_assignments','handover_categories','checklist_templates','checklist_template_items','handover_items','handover_item_comments','activity_logs','notifications'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy profiles_read on public.profiles for select to authenticated using (id = (select auth.uid()) or public.shares_org(id));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy org_read on public.organizations for select to authenticated using (public.is_member(id));
create policy org_update on public.organizations for update to authenticated using (public.is_admin(id)) with check (public.is_admin(id));

create policy members_read on public.organization_members for select to authenticated using (public.is_member(organization_id));
create policy members_update on public.organization_members for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy invitations_read on public.organization_invitations for select to authenticated using (public.is_admin(organization_id));
create policy invitations_insert on public.organization_invitations for insert to authenticated with check (public.is_admin(organization_id) and invited_by = (select auth.uid()));
create policy invitations_update on public.organization_invitations for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy periods_read on public.periods for select to authenticated using (public.is_member(organization_id));
create policy periods_insert on public.periods for insert to authenticated with check (public.is_admin(organization_id));
create policy periods_update on public.periods for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy positions_read on public.positions for select to authenticated using (public.is_member(organization_id));
create policy positions_insert on public.positions for insert to authenticated with check (public.is_admin(organization_id));
create policy positions_update on public.positions for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy pa_read on public.position_assignments for select to authenticated using (public.is_member(organization_id));
create policy pa_insert on public.position_assignments for insert to authenticated with check (public.is_admin(organization_id));
create policy pa_delete on public.position_assignments for delete to authenticated using (public.is_admin(organization_id));

create policy handovers_read on public.handovers for select to authenticated using (public.is_member(organization_id));
create policy handovers_insert on public.handovers for insert to authenticated with check (public.is_admin(organization_id) and status = 'draft');
create policy handovers_update on public.handovers for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy ha_read on public.handover_assignments for select to authenticated using (public.is_member(organization_id));
create policy ha_insert on public.handover_assignments for insert to authenticated with check (public.is_admin(organization_id));
create policy ha_update on public.handover_assignments for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy categories_read on public.handover_categories for select to authenticated using (public.is_member(organization_id));
create policy categories_insert on public.handover_categories for insert to authenticated with check (public.is_admin(organization_id));
create policy categories_update on public.handover_categories for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));

create policy templates_read on public.checklist_templates for select to authenticated using (public.is_member(organization_id));
create policy templates_insert on public.checklist_templates for insert to authenticated with check (public.is_admin(organization_id));
create policy templates_update on public.checklist_templates for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));
create policy ti_read on public.checklist_template_items for select to authenticated using (public.is_member(organization_id));
create policy ti_insert on public.checklist_template_items for insert to authenticated with check (public.is_admin(organization_id));
create policy ti_update on public.checklist_template_items for update to authenticated using (public.is_admin(organization_id)) with check (public.is_admin(organization_id));
create policy ti_delete on public.checklist_template_items for delete to authenticated using (public.is_admin(organization_id));

create policy items_read on public.handover_items for select to authenticated using (public.is_member(organization_id));
create policy items_insert on public.handover_items for insert to authenticated with check (public.is_admin(organization_id) and status = 'not_started' and version = 1);

create policy comments_read on public.handover_item_comments for select to authenticated using (public.is_member(organization_id));
create policy logs_read on public.activity_logs for select to authenticated using (public.is_member(organization_id));
create policy notifications_read on public.notifications for select to authenticated using (recipient_id = (select auth.uid()) and public.is_member(organization_id));
create policy notifications_update on public.notifications for update to authenticated using (recipient_id = (select auth.uid()) and public.is_member(organization_id)) with check (recipient_id = (select auth.uid()) and public.is_member(organization_id));

revoke all on function public.bootstrap_kodisia() from public, anon;
revoke all on function public.accept_invitation() from public, anon;
grant execute on function public.bootstrap_kodisia() to authenticated;
grant execute on function public.accept_invitation() to authenticated;

-- New Supabase projects do not expose tables to the Data API by default.
-- Explicit grants make this migration independent of the dashboard toggle.
grant usage on schema public to authenticated, service_role;
grant select on public.profiles, public.organizations, public.organization_members,
  public.organization_invitations, public.periods, public.positions, public.position_assignments,
  public.handovers, public.handover_assignments, public.handover_categories,
  public.checklist_templates, public.checklist_template_items, public.handover_items,
  public.handover_item_comments, public.activity_logs, public.notifications to authenticated;
grant insert on public.organization_invitations, public.periods, public.positions,
  public.position_assignments, public.handovers, public.handover_assignments,
  public.handover_categories, public.checklist_templates, public.checklist_template_items,
  public.handover_items to authenticated;
grant update (status,roles,expires_at) on public.organization_invitations to authenticated;
grant delete on public.position_assignments, public.checklist_template_items to authenticated;
grant select on public.organizations to service_role;
