-- Presbyterian Church Management System: additive, private operational modules.
-- Existing public content and church records are not modified.
create table if not exists public.pcms_events (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '',
 event_date timestamptz, venue text not null default '', status text not null default 'scheduled',
 created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pcms_attendance (
 id uuid primary key default gen_random_uuid(), event_id uuid references public.pcms_events(id) on delete set null,
 member_id uuid references public.church_members(id) on delete set null, attendee_name text not null default '',
 attendance_date date not null default current_date, attendance_type text not null default 'Sunday service',
 notes text not null default '', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_prayer_requests (
 id uuid primary key default gen_random_uuid(), requester_name text not null default '',
 contact text not null default '', request_text text not null, privacy text not null default 'private',
 status text not null default 'received', assigned_to text not null default '',
 follow_up_notes text not null default '', created_by uuid references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pcms_pastoral_care (
 id uuid primary key default gen_random_uuid(), member_id uuid references public.church_members(id) on delete set null,
 person_name text not null default '', care_type text not null default 'visit', summary text not null default '',
 follow_up_date date, status text not null default 'open', assigned_to text not null default '',
 created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pcms_finance (
 id uuid primary key default gen_random_uuid(), entry_date date not null default current_date,
 entry_type text not null, category text not null default '', description text not null default '',
 amount numeric(14,2) not null check (amount >= 0), payment_method text not null default '',
 reference_code text not null default '', created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.pcms_visitors (
 id uuid primary key default gen_random_uuid(), full_name text not null, phone text not null default '',
 visit_date date not null default current_date, first_time boolean not null default true,
 follow_up_status text not null default 'pending', assigned_to text not null default '',
 notes text not null default '', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_volunteers (
 id uuid primary key default gen_random_uuid(), full_name text not null, phone text not null default '',
 team text not null, availability text not null default '', status text not null default 'active',
 notes text not null default '', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_records (
 id uuid primary key default gen_random_uuid(), record_type text not null, person_name text not null,
 record_date date, reference_number text not null default '', details text not null default '',
 created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_documents (
 id uuid primary key default gen_random_uuid(), title text not null, document_type text not null default 'church document',
 file_url text not null default '', description text not null default '',
 access_level text not null default 'admin', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_equipment (
 id uuid primary key default gen_random_uuid(), item_name text not null, category text not null default '',
 quantity integer not null default 1 check (quantity >= 0), condition text not null default 'good',
 location text not null default '', notes text not null default '',
 created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_reminders (
 id uuid primary key default gen_random_uuid(), title text not null, due_at timestamptz,
 reminder_type text not null default 'general', notes text not null default '',
 status text not null default 'open', assigned_to text not null default '',
 created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_communications (
 id uuid primary key default gen_random_uuid(), title text not null, message text not null,
 audience text not null default 'whole congregation', channel text not null default 'website',
 status text not null default 'draft', scheduled_for timestamptz,
 created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.pcms_audit_log (
 id bigint generated always as identity primary key, actor_id uuid references auth.users(id),
 action text not null, module text not null, record_id text, summary text not null default '',
 created_at timestamptz not null default now()
);

do $$
declare t text;
begin
 foreach t in array array['pcms_events','pcms_attendance','pcms_prayer_requests','pcms_pastoral_care','pcms_finance','pcms_visitors','pcms_volunteers','pcms_records','pcms_documents','pcms_equipment','pcms_reminders','pcms_communications','pcms_audit_log']
 loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop policy if exists "pcms admin access" on public.%I',t);
  execute format('drop policy if exists "pcms finance admin only" on public.%I',t);
  if t='pcms_finance' or t='pcms_pastoral_care' or t='pcms_prayer_requests' or t='pcms_records' then
   execute format('create policy "pcms finance admin only" on public.%I for all to authenticated using (exists (select 1 from public.church_admins a where a.user_id=auth.uid() and a.role=''admin'')) with check (exists (select 1 from public.church_admins a where a.user_id=auth.uid() and a.role=''admin''))',t);
  else
   execute format('create policy "pcms admin access" on public.%I for all to authenticated using (private.is_church_admin()) with check (private.is_church_admin())',t);
  end if;
 end loop;
end $$;

create index if not exists pcms_events_event_date_idx on public.pcms_events(event_date);
create index if not exists pcms_attendance_date_idx on public.pcms_attendance(attendance_date);
create index if not exists pcms_prayer_status_idx on public.pcms_prayer_requests(status);
create index if not exists pcms_finance_date_idx on public.pcms_finance(entry_date);
create index if not exists pcms_visitors_date_idx on public.pcms_visitors(visit_date);
