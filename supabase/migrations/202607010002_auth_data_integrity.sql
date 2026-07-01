-- Production safety
-- Backup: run `supabase db dump --linked --schema auth,public -f backups/202607010002.sql`.
-- Rollback: restore the previous public.handle_new_user() body from migration
-- 202606290001. Existing profiles are compatible and must not be deleted.

-- OAuth providers use different metadata keys for a person's display name. The
-- profile primary key remains auth.users.id, so retries can never create duplicates.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), '')
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
