create table if not exists public.church_member_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  min_age integer,
  max_age integer,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint church_member_groups_age_range_check check (
    (min_age is null or min_age >= 0) and
    (max_age is null or max_age >= 0) and
    (min_age is null or max_age is null or min_age <= max_age)
  )
);

create table if not exists public.church_members (
  id uuid primary key default gen_random_uuid(),
  member_number text not null unique,
  first_name text not null,
  middle_name text not null default '',
  last_name text not null,
  date_of_birth date,
  gender text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  congregation text not null default '',
  occupation text not null default '',
  marital_status text not null default '',
  baptism_status text not null default '',
  confirmation_status text not null default '',
  emergency_contact_name text not null default '',
  emergency_contact_phone text not null default '',
  member_group_id uuid references public.church_member_groups(id) on delete set null,
  group_assignment text not null default 'age_based' check (group_assignment in ('age_based','manual')),
  member_status text not null default 'active' check (member_status in ('active','inactive','transferred','deceased')),
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists church_members_name_idx on public.church_members (last_name, first_name);
create index if not exists church_members_group_idx on public.church_members (member_group_id);
create index if not exists church_members_dob_idx on public.church_members (date_of_birth);

alter table public.church_member_groups enable row level security;
alter table public.church_members enable row level security;

drop policy if exists "Admins manage member groups" on public.church_member_groups;
create policy "Admins manage member groups" on public.church_member_groups
for all to authenticated using (private.is_church_admin()) with check (private.is_church_admin());

drop policy if exists "Admins manage church members" on public.church_members;
create policy "Admins manage church members" on public.church_members
for all to authenticated using (private.is_church_admin()) with check (private.is_church_admin());

grant select, insert, update, delete on public.church_member_groups to authenticated;
grant select, insert, update, delete on public.church_members to authenticated;

insert into public.church_member_groups (name, description, min_age, max_age, sort_order)
values
 ('Children Cells', 'Children and children cell membership. Adjust the age range to the district policy.', 0, 12, 10),
 ('Junior Youth (JY)', 'Junior Youth ministry. Adjust the age range to the district policy.', 13, 17, 20),
 ('Young People''s Guild (YPG)', 'Young People''s Guild membership. Adjust the age range to the district policy.', 18, 35, 30),
 ('GOI', 'GOI ministry group. Set an age range if the district uses one.', null, null, 40),
 ('Women''s Fellowship', 'Women''s Fellowship membership; age range can be configured if needed.', null, null, 50),
 ('Men''s Fellowship', 'Men''s Fellowship membership; age range can be configured if needed.', null, null, 60),
 ('Other / Unassigned', 'Members who do not currently match an age-based group.', null, null, 999)
on conflict (name) do nothing;
