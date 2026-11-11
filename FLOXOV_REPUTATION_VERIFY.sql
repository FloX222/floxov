-- FLOXOV_REPUTATION_VERIFY.sql
-- READ-ONLY verification. Run AFTER FLOXOV_REPUTATION_MIGRATION.sql.
-- This file does not create, update, or delete database objects or vote rows.

WITH table_ref AS (
  SELECT to_regclass('public.floxov_votes') AS table_oid
),
expected_columns(column_name, data_type, is_nullable) AS (
  VALUES
    ('voter_id', 'uuid', 'NO'),
    ('vote', 'smallint', 'NO'),
    ('created_at', 'timestamp with time zone', 'NO'),
    ('changed_at', 'timestamp with time zone', 'YES')
),
column_checks AS (
  SELECT
    e.column_name,
    e.data_type AS expected_type,
    e.is_nullable AS expected_nullable,
    c.data_type AS actual_type,
    c.is_nullable AS actual_nullable,
    c.column_name IS NOT NULL
      AND c.data_type = e.data_type
      AND c.is_nullable = e.is_nullable AS passed
  FROM expected_columns AS e
  LEFT JOIN information_schema.columns AS c
    ON c.table_schema = 'public'
   AND c.table_name = 'floxov_votes'
   AND c.column_name = e.column_name
),
checks AS (
  SELECT 'table exists' AS check_name, table_oid IS NOT NULL AS passed,
         coalesce(table_oid::text, 'MISSING') AS details
  FROM table_ref

  UNION ALL
  SELECT 'column: ' || column_name, passed,
         'expected ' || expected_type || ' nullable=' || expected_nullable
           || '; actual ' || coalesce(actual_type, 'MISSING')
           || ' nullable=' || coalesce(actual_nullable, 'MISSING')
  FROM column_checks

  UNION ALL
  SELECT 'single-column primary key on voter_id', EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS c CROSS JOIN table_ref AS t
    WHERE t.table_oid IS NOT NULL AND c.conrelid = t.table_oid AND c.contype = 'p'
      AND array_length(c.conkey, 1) = 1
      AND c.conkey[1] = (SELECT a.attnum FROM pg_catalog.pg_attribute AS a
                         WHERE a.attrelid = t.table_oid AND a.attname = 'voter_id' AND NOT a.attisdropped)
  ), 'voter_id must be the only primary-key column'

  UNION ALL
  SELECT 'foreign key to auth.users(id) with ON DELETE CASCADE', EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS c CROSS JOIN table_ref AS t
    WHERE t.table_oid IS NOT NULL AND c.conrelid = t.table_oid AND c.contype = 'f'
      AND c.conkey = ARRAY[(SELECT a.attnum FROM pg_catalog.pg_attribute AS a
                            WHERE a.attrelid = t.table_oid AND a.attname = 'voter_id' AND NOT a.attisdropped)]::smallint[]
      AND c.confrelid = 'auth.users'::regclass
      AND c.confkey = ARRAY[(SELECT a.attnum FROM pg_catalog.pg_attribute AS a
                             WHERE a.attrelid = 'auth.users'::regclass AND a.attname = 'id' AND NOT a.attisdropped)]::smallint[]
      AND c.confdeltype = 'c'
  ), 'voter_id references auth.users(id) with cascade deletion'

  UNION ALL
  SELECT 'vote CHECK constraint is validated', EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS c CROSS JOIN table_ref AS t
    WHERE t.table_oid IS NOT NULL AND c.conrelid = t.table_oid
      AND c.conname = 'floxov_votes_vote_allowed_values_check'
      AND c.contype = 'c' AND c.convalidated
      AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%vote%'
      AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%-1%'
      AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%1%'
  ), 'vote is restricted to -1 and +1'

  UNION ALL
  SELECT 'RLS enabled', coalesce((
    SELECT cls.relrowsecurity FROM pg_catalog.pg_class AS cls CROSS JOIN table_ref AS t
    WHERE cls.oid = t.table_oid
  ), false), 'relrowsecurity must be true'

  UNION ALL
  SELECT 'authenticated SELECT policy is own-row only', EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies AS p
    WHERE p.schemaname = 'public' AND p.tablename = 'floxov_votes'
      AND p.policyname = 'floxov_votes_select_own'
      AND 'authenticated' = ANY(p.roles)
      AND p.permissive = 'PERMISSIVE'
      AND p.qual ILIKE '%voter_id%' AND p.qual ILIKE '%auth.uid%'
  ), 'policy must restrict SELECT to voter_id = auth.uid()'

  UNION ALL
  SELECT 'restrictive SELECT policy prevents cross-user row access', EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies AS p
    WHERE p.schemaname = 'public' AND p.tablename = 'floxov_votes'
      AND p.policyname = 'floxov_votes_select_own_restrict'
      AND p.permissive = 'RESTRICTIVE'
      AND 'authenticated' = ANY(p.roles)
      AND p.qual ILIKE '%voter_id%' AND p.qual ILIKE '%auth.uid%'
  ), 'restrictive own-row policy is present even if another permissive policy exists'

  UNION ALL
  SELECT 'anon has no direct table privileges', CASE WHEN t.table_oid IS NULL THEN false ELSE
    NOT has_table_privilege('anon', t.table_oid, 'SELECT')
    AND NOT has_table_privilege('anon', t.table_oid, 'INSERT')
    AND NOT has_table_privilege('anon', t.table_oid, 'UPDATE')
    AND NOT has_table_privilege('anon', t.table_oid, 'DELETE') END,
    'anon cannot read or modify floxov_votes directly'
  FROM table_ref AS t

  UNION ALL
  SELECT 'authenticated can SELECT only through own-row RLS', CASE WHEN t.table_oid IS NULL THEN false ELSE
    has_table_privilege('authenticated', t.table_oid, 'SELECT')
    AND NOT has_table_privilege('authenticated', t.table_oid, 'INSERT')
    AND NOT has_table_privilege('authenticated', t.table_oid, 'UPDATE')
    AND NOT has_table_privilege('authenticated', t.table_oid, 'DELETE') END,
    'authenticated has SELECT; INSERT/UPDATE/DELETE are revoked'
  FROM table_ref AS t

  UNION ALL
  SELECT 'get_floxov_reputation() exists', to_regprocedure('public.get_floxov_reputation()') IS NOT NULL,
         'public.get_floxov_reputation()'

  UNION ALL
  SELECT 'vote_floxov(smallint) exists', to_regprocedure('public.vote_floxov(smallint)') IS NOT NULL,
         'public.vote_floxov(smallint)'

  UNION ALL
  SELECT 'get RPC is SECURITY DEFINER, owned by postgres, fixed search_path', EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS p
    WHERE p.oid = to_regprocedure('public.get_floxov_reputation()')
      AND p.prosecdef AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
      AND coalesce(p.proconfig, ARRAY[]::text[]) @> ARRAY['search_path=""']::text[]
  ), 'SECURITY DEFINER; owner=postgres; search_path=""'

  UNION ALL
  SELECT 'vote RPC is SECURITY DEFINER, owned by postgres, fixed search_path', EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS p
    WHERE p.oid = to_regprocedure('public.vote_floxov(smallint)')
      AND p.prosecdef AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
      AND coalesce(p.proconfig, ARRAY[]::text[]) @> ARRAY['search_path=""']::text[]
  ), 'SECURITY DEFINER; owner=postgres; search_path=""'

  UNION ALL
  SELECT 'authenticated can execute get RPC', coalesce(has_function_privilege(
    'authenticated', to_regprocedure('public.get_floxov_reputation()'), 'EXECUTE'), false),
    'EXECUTE is granted to authenticated'

  UNION ALL
  SELECT 'authenticated can execute vote RPC', coalesce(has_function_privilege(
    'authenticated', to_regprocedure('public.vote_floxov(smallint)'), 'EXECUTE'), false),
    'EXECUTE is granted to authenticated'

  UNION ALL
  SELECT 'anon cannot execute get RPC', NOT coalesce(has_function_privilege(
    'anon', to_regprocedure('public.get_floxov_reputation()'), 'EXECUTE'), false),
    'anon EXECUTE is revoked'

  UNION ALL
  SELECT 'anon cannot execute vote RPC', NOT coalesce(has_function_privilege(
    'anon', to_regprocedure('public.vote_floxov(smallint)'), 'EXECUTE'), false),
    'anon EXECUTE is revoked'

  UNION ALL
  SELECT 'PUBLIC cannot execute get RPC', NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS p
    CROSS JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) AS acl
    WHERE p.oid = to_regprocedure('public.get_floxov_reputation()')
      AND acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
  ), 'PUBLIC EXECUTE is revoked'

  UNION ALL
  SELECT 'PUBLIC cannot execute vote RPC', NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS p
    CROSS JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) AS acl
    WHERE p.oid = to_regprocedure('public.vote_floxov(smallint)')
      AND acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
  ), 'PUBLIC EXECUTE is revoked'
)
SELECT check_name,
       CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS result,
       details
FROM checks
ORDER BY check_name;

-- Function metadata. This query is read-only.
SELECT
  p.oid::regprocedure AS function_signature,
  pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,
  p.prosecdef AS security_definer,
  p.proconfig AS function_settings,
  pg_catalog.pg_get_function_result(p.oid) AS return_type
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_floxov_reputation', 'vote_floxov')
ORDER BY p.proname;

-- Aggregate sanity summary. No voter IDs or other identity data are returned.
SELECT
  count(*) FILTER (WHERE vote = 1)::bigint AS likes,
  count(*) FILTER (WHERE vote = -1)::bigint AS dislikes,
  (50::bigint + count(*) FILTER (WHERE vote = 1) - count(*) FILTER (WHERE vote = -1))::bigint AS reputation,
  count(*)::bigint AS total_votes,
  count(*) FILTER (WHERE changed_at IS NULL)::bigint AS never_changed_votes,
  count(*) FILTER (WHERE changed_at IS NOT NULL)::bigint AS changed_votes
FROM public.floxov_votes;
