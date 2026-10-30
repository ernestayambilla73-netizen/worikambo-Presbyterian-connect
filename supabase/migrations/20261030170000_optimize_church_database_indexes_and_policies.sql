-- Non-destructive performance improvements for Peace Congregation.
-- Add indexes for foreign-key lookups and make auth.uid() a statement-level value
-- in the four administrator-only policies flagged by the Supabase performance advisor.

create index if not exists pcms_attendance_created_by_idx on public.pcms_attendance (created_by);
create index if not exists pcms_attendance_event_id_idx on public.pcms_attendance (event_id);
create index if not exists pcms_audit_log_actor_id_idx on public.pcms_audit_log (actor_id);
create index if not exists pcms_communications_created_by_idx on public.pcms_communications (created_by);
create index if not exists pcms_documents_created_by_idx on public.pcms_documents (created_by);
create index if not exists pcms_equipment_created_by_idx on public.pcms_equipment (created_by);
create index if not exists pcms_events_created_by_idx on public.pcms_events (created_by);
create index if not exists pcms_finance_created_by_idx on public.pcms_finance (created_by);
create index if not exists pcms_pastoral_care_created_by_idx on public.pcms_pastoral_care (created_by);
create index if not exists pcms_pastoral_care_member_id_idx on public.pcms_pastoral_care (member_id);
create index if not exists pcms_prayer_requests_created_by_idx on public.pcms_prayer_requests (created_by);
create index if not exists pcms_records_created_by_idx on public.pcms_records (created_by);
create index if not exists pcms_reminders_created_by_idx on public.pcms_reminders (created_by);
create index if not exists pcms_visitors_created_by_idx on public.pcms_visitors (created_by);
create index if not exists pcms_volunteers_created_by_idx on public.pcms_volunteers (created_by);

drop policy if exists "pcms finance admin only" on public.pcms_finance;
create policy "pcms finance admin only" on public.pcms_finance
for all to authenticated
using (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'))
with check (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'));

drop policy if exists "pcms finance admin only" on public.pcms_pastoral_care;
create policy "pcms finance admin only" on public.pcms_pastoral_care
for all to authenticated
using (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'))
with check (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'));

drop policy if exists "pcms finance admin only" on public.pcms_prayer_requests;
create policy "pcms finance admin only" on public.pcms_prayer_requests
for all to authenticated
using (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'))
with check (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'));

drop policy if exists "pcms finance admin only" on public.pcms_records;
create policy "pcms finance admin only" on public.pcms_records
for all to authenticated
using (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'))
with check (exists (select 1 from public.church_admins a where a.user_id = (select auth.uid()) and a.role = 'admin'));
