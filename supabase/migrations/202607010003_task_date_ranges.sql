-- Production safety
-- Backup: run `supabase db dump --linked --table public.todos -f backups/202607010003.sql`.
-- Rollback: drop index todos_user_start_date_idx, drop constraint
-- todos_valid_date_range, then drop public.todos.start_date. Existing due dates remain intact.

alter table public.todos
add column start_date timestamptz;

-- Existing scheduled tasks were single-day tasks, so their previous deadline is
-- also their initial start date.
update public.todos
set start_date = due_date
where due_date is not null
  and start_date is null;

alter table public.todos
add constraint todos_valid_date_range
check (
  (start_date is null and due_date is null)
  or (start_date is not null and due_date is not null and due_date >= start_date)
);

create index todos_user_start_date_idx
on public.todos (user_id, start_date);
