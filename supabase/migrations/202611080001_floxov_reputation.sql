-- FLOXOV reputation system
-- Upgrade-safe migration. Does not delete votes or auth users.
-- One active vote per Supabase identity; vote changes are rate-limited to 24 hours.

begin;

create table if not exists public.floxov_votes (
  voter_id uuid primary key references auth.users (id) on delete cascade,
  vote smallint not null,
  created_at timestamptz not null default now(),
  changed_at timestamptz
);

-- Add missing columns for an older compatible installation without dropping data.
alter table public.floxov_votes
  add column if not exists voter_id uuid,
  add column if not exists vote smallint,
  add column if not exists created_at timestamptz,
  add column if not exists changed_at timestamptz;

-- Refuse to silently accept an incompatible legacy table.
do $migration_check$
begin
  if exists (
    select 1 from public.floxov_votes
    where voter_id is null or vote is null or created_at is null
  ) then
    raise exception 'floxov_votes contains NULL required values; resolve existing rows before applying this migration';
  end if;
  if exists (
    select 1 from public.floxov_votes where vote not in (-1, 1)
  ) then
    raise exception 'floxov_votes contains invalid vote values; resolve existing rows before applying this migration';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.floxov_votes'::regclass
      and contype = 'p'
      and pg_get_constraintdef(oid) ilike '%voter_id%'
  ) then
    raise exception 'floxov_votes must have voter_id as its primary key; migration stopped without deleting data';
  end if;
end
$migration_check$;

alter table public.floxov_votes
  alter column voter_id set not null,
  alter column vote set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column changed_at drop not null,
  alter column changed_at drop default;

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.floxov_votes'::regclass
      and conname = 'floxov_votes_vote_check'
  ) then
    alter table public.floxov_votes
      add constraint floxov_votes_vote_check check (vote in (-1, 1));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.floxov_votes'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%auth.users%'
  ) then
    alter table public.floxov_votes
      add constraint floxov_votes_voter_id_fkey
      foreign key (voter_id) references auth.users(id) on delete cascade;
  end if;
end
$constraints$;

alter table public.floxov_votes enable row level security;
revoke all on table public.floxov_votes from public, anon, authenticated;

create or replace function public.get_floxov_reputation()
returns table (
  likes bigint,
  dislikes bigint,
  reputation bigint,
  my_vote smallint,
  can_change_at timestamptz,
  seconds_remaining bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  return query
  with totals as (
    select
      count(*) filter (where v.vote = 1)::bigint as likes,
      count(*) filter (where v.vote = -1)::bigint as dislikes
    from public.floxov_votes as v
  ),
  mine as (
    select
      v.vote,
      coalesce(v.changed_at, v.created_at) + interval '24 hours' as change_at
    from public.floxov_votes as v
    where v.voter_id = v_uid
  )
  select
    t.likes,
    t.dislikes,
    t.likes - t.dislikes,
    m.vote,
    m.change_at,
    case
      when m.change_at is null then 0::bigint
      else greatest(0, ceil(extract(epoch from (m.change_at - statement_timestamp()))))::bigint
    end
  from totals as t
  left join mine as m on true;
end;
$function$;

create or replace function public.vote_floxov(p_vote smallint)
returns table (
  status text,
  likes bigint,
  dislikes bigint,
  reputation bigint,
  my_vote smallint,
  can_change_at timestamptz,
  seconds_remaining bigint
)
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_existing public.floxov_votes%rowtype;
  v_status text := 'accepted';
  v_now timestamptz := clock_timestamp();
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if p_vote is null or p_vote not in (-1, 1) then
    raise exception 'invalid_vote' using errcode = '22023';
  end if;

  -- Serializes all requests for this identity, including the initial insert race.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_uid::text, 0)
  );

  select v.*
    into v_existing
  from public.floxov_votes as v
  where v.voter_id = v_uid
  for update;

  if not found then
    insert into public.floxov_votes (voter_id, vote, created_at, changed_at)
    values (v_uid, p_vote, v_now, null);
  elsif v_existing.vote = p_vote then
    v_status := 'unchanged';
  elsif v_now < coalesce(v_existing.changed_at, v_existing.created_at) + interval '24 hours' then
    v_status := 'cooldown';
  else
    update public.floxov_votes as v
       set vote = p_vote,
           changed_at = v_now
     where v.voter_id = v_uid;
  end if;

  return query
  with totals as (
    select
      count(*) filter (where v.vote = 1)::bigint as likes,
      count(*) filter (where v.vote = -1)::bigint as dislikes
    from public.floxov_votes as v
  ),
  mine as (
    select
      v.vote,
      coalesce(v.changed_at, v.created_at) + interval '24 hours' as change_at
    from public.floxov_votes as v
    where v.voter_id = v_uid
  )
  select
    v_status,
    t.likes,
    t.dislikes,
    t.likes - t.dislikes,
    m.vote,
    m.change_at,
    case
      when m.change_at is null then 0::bigint
      else greatest(0, ceil(extract(epoch from (m.change_at - clock_timestamp()))))::bigint
    end
  from totals as t
  left join mine as m on true;
end;
$function$;

revoke all on function public.get_floxov_reputation() from public, anon;
revoke all on function public.vote_floxov(smallint) from public, anon;
grant execute on function public.get_floxov_reputation() to authenticated;
grant execute on function public.vote_floxov(smallint) to authenticated;

commit;
