-- Keep one SELECT policy per content table while preserving admin write access.
-- The existing read policies already allow administrators to read drafts/unpublished rows.
drop policy if exists "Admins manage congregations" on public.church_congregations;
create policy "Admins insert congregations" on public.church_congregations for insert to authenticated with check (private.is_church_admin());
create policy "Admins update congregations" on public.church_congregations for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete congregations" on public.church_congregations for delete to authenticated using (private.is_church_admin());

drop policy if exists "Admins manage church gallery" on public.church_gallery;
create policy "Admins insert church gallery" on public.church_gallery for insert to authenticated with check (private.is_church_admin());
create policy "Admins update church gallery" on public.church_gallery for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete church gallery" on public.church_gallery for delete to authenticated using (private.is_church_admin());

drop policy if exists "Admins manage ministries" on public.church_ministries;
create policy "Admins insert ministries" on public.church_ministries for insert to authenticated with check (private.is_church_admin());
create policy "Admins update ministries" on public.church_ministries for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete ministries" on public.church_ministries for delete to authenticated using (private.is_church_admin());

drop policy if exists "Admins manage page content" on public.church_page_content;
create policy "Admins insert page content" on public.church_page_content for insert to authenticated with check (private.is_church_admin());
create policy "Admins update page content" on public.church_page_content for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete page content" on public.church_page_content for delete to authenticated using (private.is_church_admin());

drop policy if exists "Admins manage posts" on public.church_posts;
create policy "Admins insert posts" on public.church_posts for insert to authenticated with check (private.is_church_admin());
create policy "Admins update posts" on public.church_posts for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete posts" on public.church_posts for delete to authenticated using (private.is_church_admin());

drop policy if exists "Admins manage resources" on public.church_resources;
create policy "Admins insert resources" on public.church_resources for insert to authenticated with check (private.is_church_admin());
create policy "Admins update resources" on public.church_resources for update to authenticated using (private.is_church_admin()) with check (private.is_church_admin());
create policy "Admins delete resources" on public.church_resources for delete to authenticated using (private.is_church_admin());
