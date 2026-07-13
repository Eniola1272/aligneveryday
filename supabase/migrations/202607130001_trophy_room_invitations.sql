-- Production safety
-- Backup: run `supabase db dump --linked --schema public -f backups/202607130001.sql`.
-- Rollback: drop policies "Accepted invitees can view inviter profiles" on
-- public.profiles and "Accepted invitees can view completed inviter courses" on
-- public.courses, then drop public.portfolio_invitations,
-- public.protect_portfolio_invitation_identity(), and
-- public.portfolio_invitation_status. Restore the backup if invitation history
-- needs to be retained.

create type public.portfolio_invitation_status as enum (
  'pending',
  'accepted',
  'declined'
);

create table public.portfolio_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid references public.profiles (id) on delete cascade,
  invitee_email text,
  status public.portfolio_invitation_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  declined_at timestamptz,
  constraint portfolio_invitations_recipient_required
    check (invitee_id is not null or invitee_email is not null),
  constraint portfolio_invitations_email_normalized
    check (invitee_email is null or invitee_email = lower(invitee_email)),
  constraint portfolio_invitations_status_timestamps
    check (
      (status = 'accepted' and accepted_at is not null and declined_at is null)
      or (status = 'declined' and declined_at is not null and accepted_at is null)
      or (status = 'pending' and accepted_at is null and declined_at is null)
    )
);

create unique index portfolio_invitations_unique_invitee_idx
on public.portfolio_invitations (inviter_id, invitee_id)
where invitee_id is not null and status = 'pending';

create unique index portfolio_invitations_unique_email_idx
on public.portfolio_invitations (inviter_id, invitee_email)
where invitee_email is not null and status = 'pending';

create index portfolio_invitations_inviter_status_idx
on public.portfolio_invitations (inviter_id, status);

create index portfolio_invitations_invitee_status_idx
on public.portfolio_invitations (invitee_id, status);

create index portfolio_invitations_email_status_idx
on public.portfolio_invitations (invitee_email, status);

create function public.protect_portfolio_invitation_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.inviter_id <> new.inviter_id
    or old.invitee_email is distinct from new.invitee_email
    or old.created_at <> new.created_at then
    raise exception 'Invitation identity fields cannot be changed.';
  end if;

  if old.status <> 'pending' and old.status <> new.status then
    raise exception 'Finalized invitations cannot be changed.';
  end if;

  return new;
end;
$$;

create trigger protect_portfolio_invitation_identity
before update on public.portfolio_invitations
for each row execute procedure public.protect_portfolio_invitation_identity();

alter table public.portfolio_invitations enable row level security;

create policy "Portfolio invitations are visible to involved users"
on public.portfolio_invitations for select
using (
  auth.uid() = inviter_id
  or auth.uid() = invitee_id
  or lower(invitee_email) = lower(auth.jwt() ->> 'email')
);

create policy "Users can create portfolio invitations"
on public.portfolio_invitations for insert
with check (
  auth.uid() = inviter_id
  and status = 'pending'
  and accepted_at is null
  and declined_at is null
);

create policy "Invitees can answer portfolio invitations"
on public.portfolio_invitations for update
using (
  status = 'pending'
  and (
    auth.uid() = invitee_id
    or lower(invitee_email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  invitee_id = auth.uid()
  and status in ('accepted', 'declined')
);

create policy "Inviters can remove portfolio invitations"
on public.portfolio_invitations for delete
using (auth.uid() = inviter_id);

create policy "Accepted invitees can view inviter profiles"
on public.profiles for select
using (
  exists (
    select 1
    from public.portfolio_invitations
    where portfolio_invitations.inviter_id = profiles.id
      and portfolio_invitations.status = 'accepted'
      and (
        portfolio_invitations.invitee_id = auth.uid()
        or lower(portfolio_invitations.invitee_email) = lower(auth.jwt() ->> 'email')
      )
  )
);

create policy "Accepted invitees can view completed inviter courses"
on public.courses for select
using (
  status = 'completed'
  and exists (
    select 1
    from public.portfolio_invitations
    where portfolio_invitations.inviter_id = courses.user_id
      and portfolio_invitations.status = 'accepted'
      and (
        portfolio_invitations.invitee_id = auth.uid()
        or lower(portfolio_invitations.invitee_email) = lower(auth.jwt() ->> 'email')
      )
  )
);
