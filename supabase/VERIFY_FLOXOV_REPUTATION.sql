-- FLOXOV reputation schema verification.
-- Run in Supabase SQL Editor (postgres role). This verifies structure/security;
-- authenticated behavior must additionally be tested from a real browser session.

with expected_columns(column_name, data_type, is_nullable) as (
  values
    ('voter_id', 'uuid', 'NO'),
    ('vote', 'smallint', 'NO'),
    ('created_at', 'timestamp with time zone', 'NO'),
    ('changed_at', 'timestamp with time zone', 'YES')
),
column_checks as (
  select e.column_name, e.data_type as expected_type, e.is_nullable as expected_nullable,
         c.data_type as actual_type, c.is_nullable as actual_nullable,
         (c.column_name is not null
          and c.data_type = e.data_type
          and c.is_nullable = e.is_nullable) as passed
  from expected_columns e
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = 'floxov_votes'
   and c.column_name = e.column_name
),
checks as (
  select 'table exists' as check_name,
         to_regclass('public.floxov_votes') is not null as passed,
         coalesce(to_regclass('public.floxov_votes')::text, 'MISSING') as details
  union all
  select 'column: ' || column_name, passed,
         'expected ' || expected_type || ' nullable=' || expected_nullable
         || '; actual ' || coalesce(actual_type, 'MISSING')
         || ' nullable=' || coalesce(actual_nullable, 'MISSING')
  from column_checks
  union all
  select 'primary key on voter_id',
         exists (
           select 1 from pg_constraint c
           where c.conrelid = 'public.floxov_votes'::regclass
             and c.contype = 'p'
             and pg_get_constraintdef(c.oid) ilike '%(voter_id)%'
         ), 'voter_id must be the sole primary key'
  union all
  select 'foreign key to auth.users',
         exists (
           select 1 from pg_constraint c
           where c.conrelid = 'public.floxov_votes'::regclass
             and c.contype = 'f'
             and c.confrelid = 'auth.users'::regclass
             and pg_get_constraintdef(c.oid) ilike '%(voter_id)%'
         ), 'voter_id references auth.users(id)'
  union all
  select 'vote constraint',
         exists (
           select 1 from pg_constraint c
           where c.conrelid = 'public.floxov_votes'::regclass
             and c.contype = 'c'
             and pg_get_constraintdef(c.oid) ilike '%vote%'
             and pg_get_constraintdef(c.oid) like '%-1%'
             and pg_get_constraintdef(c.oid) like '%1%'
         ), 'vote must be restricted to -1 and 1'
  union all
  select 'RLS enabled',
         coalesce((select relrowsecurity from pg_class where oid = 'public.floxov_votes'::regclass), false),
         'relrowsecurity must be true'
  union all
  select 'anon has no table privileges',
         not has_table_privilege('anon', 'public.floxov_votes', 'SELECT')
         and not has_table_privilege('anon', 'public.floxov_votes', 'INSERT')
         and not has_table_privilege('anon', 'public.floxov_votes', 'UPDATE')
         and not has_table_privilege('anon', 'public.floxov_votes', 'DELETE'),
         'anon must not access the table directly'
  union all
  select 'authenticated has no table privileges',
         not has_table_privilege('authenticated', 'public.floxov_votes', 'SELECT')
         and not has_table_privilege('authenticated', 'public.floxov_votes', 'INSERT')
         and not has_table_privilege('authenticated', 'public.floxov_votes', 'UPDATE')
         and not has_table_privilege('authenticated', 'public.floxov_votes', 'DELETE'),
         'authenticated must not access the table directly'
  union all
  select 'get_floxov_reputation() exists',
         to_regprocedure('public.get_floxov_reputation()') is not null,
         'public.get_floxov_reputation()'
  union all
  select 'vote_floxov(smallint) exists',
         to_regprocedure('public.vote_floxov(smallint)') is not null,
         'public.vote_floxov(smallint)'
  union all
  select 'authenticated can execute get RPC',
         coalesce(has_function_privilege('authenticated', 'public.get_floxov_reputation()', 'EXECUTE'), false),
         'EXECUTE grant required'
  union all
  select 'authenticated can execute vote RPC',
         coalesce(has_function_privilege('authenticated', 'public.vote_floxov(smallint)', 'EXECUTE'), false),
         'EXECUTE grant required'
  union all
  select 'anon cannot execute get RPC',
         not coalesce(has_function_privilege('anon', 'public.get_floxov_reputation()', 'EXECUTE'), false),
         'anon EXECUTE must be revoked'
  union all
  select 'anon cannot execute vote RPC',
         not coalesce(has_function_privilege('anon', 'public.vote_floxov(smallint)', 'EXECUTE'), false),
         'anon EXECUTE must be revoked'
)
select check_name, case when passed then 'PASS' else 'FAIL' end as result, details
from checks
order by check_name;

-- Function signatures and security metadata:
select
  p.oid::regprocedure as function_signature,
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  pg_get_function_result(p.oid) as return_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_floxov_reputation', 'vote_floxov')
order by p.proname;

-- Data sanity summary. Does not expose voter identities.
select
  count(*) filter (where vote = 1)::bigint as likes,
  count(*) filter (where vote = -1)::bigint as dislikes,
  (count(*) filter (where vote = 1) - count(*) filter (where vote = -1))::bigint as reputation,
  count(*)::bigint as total_votes
from public.floxov_votes;
