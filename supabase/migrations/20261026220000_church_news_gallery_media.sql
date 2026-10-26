alter table public.church_posts add column if not exists image_url text not null default '';
alter table public.church_posts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.church_gallery (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 caption text not null default '',
 image_url text not null,
 album text not null default 'District life',
 event_date date,
 is_published boolean not null default false,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists church_gallery_published_idx on public.church_gallery (is_published, event_date desc, created_at desc);
alter table public.church_gallery enable row level security;
drop policy if exists "Admins manage church gallery" on public.church_gallery;
create policy "Admins manage church gallery" on public.church_gallery for all to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
drop policy if exists "Public read published gallery" on public.church_gallery;
create policy "Public read published gallery" on public.church_gallery for select to anon using (is_published);
drop policy if exists "Authenticated read published gallery" on public.church_gallery;
create policy "Authenticated read published gallery" on public.church_gallery for select to authenticated using (is_published or private.is_church_admin());
grant select, insert, update, delete on public.church_gallery to authenticated;
grant select on public.church_gallery to anon;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('church-gallery','church-gallery',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=10485760, allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public view church gallery images" on storage.objects;
create policy "Public view church gallery images" on storage.objects for select to anon, authenticated using (bucket_id='church-gallery');
drop policy if exists "Church admins upload gallery images" on storage.objects;
create policy "Church admins upload gallery images" on storage.objects for insert to authenticated with check (bucket_id='church-gallery' and private.is_church_admin());
drop policy if exists "Church admins update gallery images" on storage.objects;
create policy "Church admins update gallery images" on storage.objects for update to authenticated using (bucket_id='church-gallery' and private.is_church_admin()) with check (bucket_id='church-gallery' and private.is_church_admin());
drop policy if exists "Church admins delete gallery images" on storage.objects;
create policy "Church admins delete gallery images" on storage.objects for delete to authenticated using (bucket_id='church-gallery' and private.is_church_admin());