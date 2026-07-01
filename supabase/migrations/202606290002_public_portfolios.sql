-- Production safety
-- Backup: run `supabase db dump --linked --schema public -f backups/202606290002.sql`.
-- Rollback: drop policies "Public profiles are viewable" on public.profiles and
-- "Completed courses on public portfolios are viewable" on public.courses.

create policy "Public profiles are viewable"
on public.profiles for select
using (portfolio_public = true);

create policy "Completed courses on public portfolios are viewable"
on public.courses for select
using (
  status = 'completed'
  and exists (
    select 1
    from public.profiles
    where profiles.id = courses.user_id
      and profiles.portfolio_public = true
  )
);
