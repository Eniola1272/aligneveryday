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
