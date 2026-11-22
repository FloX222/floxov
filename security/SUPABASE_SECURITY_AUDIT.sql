-- READ-ONLY security inspection; run in Supabase SQL Editor. Does NOT mutate data.
-- Verify functions exist, are security-definer, and have controlled search_path.
SELECT n.nspname AS schema, p.proname AS function_name,
       p.prosecdef AS security_definer,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       p.proconfig AS settings,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('get_floxov_reputation','vote_floxov');

-- Verify RLS is enabled and row policies are restricted to the caller.
SELECT c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS force_rls
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='floxov_votes';
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname='public' AND tablename='floxov_votes';

-- No direct INSERT, UPDATE, DELETE or TRUNCATE should be granted to anon/authenticated.
SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema='public' AND table_name='floxov_votes'
ORDER BY grantee, privilege_type;

-- Find additional public functions that might expose elevated access.
SELECT p.proname, pg_get_function_identity_arguments(p.oid) args,
       p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid,'EXECUTE') AS anonymous_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.prokind='f'
ORDER BY p.proname;
