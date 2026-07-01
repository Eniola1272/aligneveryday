-- Production safety
-- Backup: run `supabase db dump --linked --table public.todos -f backups/202607010001.sql`.
-- Rollback: drop the two indexes, then drop public.todos.completed_at and
-- public.todos.sort_order. Restore the backup if historical completion times matter.

alter table public.todos
add column completed_at timestamptz,
add column sort_order integer not null default 0;

update public.todos
set completed_at = coalesce(due_date, now())
where is_completed = true
  and completed_at is null;

create index todos_user_completed_at_idx
on public.todos (user_id, completed_at desc);

create index todos_user_sort_order_idx
on public.todos (user_id, sort_order);
