create type public.course_status as enum ('backlog', 'in_progress', 'completed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  portfolio_public boolean not null default false
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  platform text not null,
  source_url text,
  total_duration_sec integer not null default 0 check (total_duration_sec >= 0),
  current_progress_sec integer not null default 0 check (current_progress_sec >= 0),
  status public.course_status not null default 'backlog'
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  task_title text not null,
  is_completed boolean not null default false,
  due_date timestamptz
);

create index courses_user_status_idx on public.courses (user_id, status);
create index todos_user_due_date_idx on public.todos (user_id, due_date);
create index todos_course_id_idx on public.todos (course_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.todos enable row level security;

create policy "Profiles are owned by their user"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Courses are owned by their user"
on public.courses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Todos are owned by their user"
on public.todos for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
