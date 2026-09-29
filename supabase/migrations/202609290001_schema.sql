-- Handover KODISIA MVP. Apply in order with the following migration files.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 2 and 120),
  logo_url text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  roles text[] not null check (cardinality(roles) > 0 and roles <@ array['admin','outgoing','incoming']::text[]),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (email = lower(btrim(email))),
  roles text[] not null check (cardinality(roles) > 0 and roles <@ array['admin','outgoing','incoming']::text[]),
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index one_pending_invitation_per_email on public.organization_invitations(organization_id, email) where status = 'pending';

create table public.periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null check (length(btrim(label)) between 2 and 100),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, label),
  check (starts_on is null or ends_on is null or starts_on <= ends_on)
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(btrim(name)) between 2 and 100),
  division text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name)
);

create table public.position_assignments (
  organization_id uuid not null,
  period_id uuid not null,
  position_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, period_id, position_id, user_id),
  foreign key (organization_id, period_id) references public.periods(organization_id, id),
  foreign key (organization_id, position_id) references public.positions(organization_id, id),
  foreign key (organization_id, user_id) references public.organization_members(organization_id, user_id)
);

create table public.handovers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  from_period_id uuid not null,
  to_period_id uuid not null,
  status text not null default 'draft' check (status in ('draft','active','completed')),
  due_on date,
  activated_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, from_period_id) references public.periods(organization_id, id),
  foreign key (organization_id, to_period_id) references public.periods(organization_id, id),
  check (from_period_id <> to_period_id)
);
create unique index one_active_handover_per_pair on public.handovers
  (organization_id, from_period_id, to_period_id) where status = 'active';

create table public.handover_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  handover_id uuid not null,
  position_id uuid not null,
  outgoing_user_id uuid not null,
  incoming_user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, handover_id, id),
  unique (organization_id, handover_id, position_id),
  foreign key (organization_id, handover_id) references public.handovers(organization_id, id),
  foreign key (organization_id, position_id) references public.positions(organization_id, id),
  foreign key (organization_id, outgoing_user_id) references public.organization_members(organization_id, user_id),
  foreign key (organization_id, incoming_user_id) references public.organization_members(organization_id, user_id),
  check (outgoing_user_id <> incoming_user_id)
);

create table public.handover_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  handover_id uuid not null,
  name text not null check (length(btrim(name)) between 2 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, handover_id, id),
  unique (organization_id, handover_id, name),
  foreign key (organization_id, handover_id) references public.handovers(organization_id, id)
);

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(btrim(name)) between 2 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name)
);

create table public.checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  template_id uuid not null,
  category_name text not null,
  title text not null check (length(btrim(title)) between 2 and 200),
  description text not null default '',
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  foreign key (organization_id, template_id) references public.checklist_templates(organization_id, id)
);

create table public.handover_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  handover_id uuid not null,
  assignment_id uuid not null,
  category_id uuid not null,
  title text not null default '',
  description text not null default '',
  notes text not null default '',
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  reference_label text,
  reference_url text,
  is_required boolean not null default true,
  is_active boolean not null default true,
  due_on date,
  status text not null default 'not_started' check (status in ('not_started','in_progress','ready_for_review','revision_required','verified')),
  submitted_at timestamptz,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, handover_id, id),
  foreign key (organization_id, handover_id) references public.handovers(organization_id, id),
  foreign key (organization_id, handover_id, assignment_id) references public.handover_assignments(organization_id, handover_id, id),
  foreign key (organization_id, handover_id, category_id) references public.handover_categories(organization_id, handover_id, id),
  check (reference_url is null or reference_url ~ '^https://[^[:space:]]+$')
);

create table public.handover_item_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  handover_id uuid not null,
  item_id uuid not null,
  author_id uuid not null references auth.users(id),
  author_label text not null default 'Anggota',
  body text not null check (length(btrim(body)) between 1 and 4000),
  is_revision_reason boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (organization_id, handover_id, item_id) references public.handover_items(organization_id, handover_id, id)
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  handover_id uuid,
  item_id uuid,
  subject_type text,
  subject_id text,
  actor_id uuid references auth.users(id),
  actor_label text not null default 'Sistem',
  event_type text not null,
  summary text not null,
  old_status text,
  new_status text,
  reason text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_id uuid not null,
  handover_id uuid,
  item_id uuid,
  event_type text not null,
  message text not null,
  dedupe_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, recipient_id) references public.organization_members(organization_id, user_id)
);

create index members_by_user on public.organization_members(user_id) where is_active;
create index items_by_handover_status on public.handover_items(organization_id, handover_id, status, updated_at desc);
create index items_by_assignment on public.handover_items(assignment_id, status);
create index items_search on public.handover_items using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(notes,'') || ' ' || coalesce(details->>'name','') || ' ' || coalesce(details->>'affiliation','')));
create index logs_by_org_time on public.activity_logs(organization_id, created_at desc);
create index notifications_by_recipient on public.notifications(recipient_id, created_at desc);

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
do $$ declare t text; begin
  foreach t in array array['profiles','organizations','organization_members','periods','positions','handovers','handover_assignments','checklist_templates','handover_items'] loop
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;
