-- Production safety
-- Backup: run `supabase db dump --linked --schema auth,public -f backups/202606290001.sql`.
-- Rollback: drop trigger auth.users.on_auth_user_created, then drop
-- public.handle_new_user(); existing profile rows should be retained.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
