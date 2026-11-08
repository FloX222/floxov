-- FLOXOV reputation system: repeatable, upgrade-safe migration.
-- Run this file in the EXISTING Supabase project from SQL Editor.
-- Preserves all existing vote rows. Does not drop tables, votes, functions, or other objects.
-- Initial vote: changed_at = NULL; cooldown is based on created_at.
-- Changed vote: changed_at stores the last successful change timestamp.

BEGIN;

CREATE TABLE IF NOT EXISTS public.floxov_votes (
  voter_id uuid NOT NULL,
  vote smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  changed_at timestamptz NULL,
  CONSTRAINT floxov_votes_pkey PRIMARY KEY (voter_id),
  CONSTRAINT floxov_votes_voter_id_fkey
    FOREIGN KEY (voter_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT floxov_votes_vote_allowed_values_check
    CHECK (vote IN (-1, 1))
);

-- Add only missing columns. Existing rows are checked below before NOT NULL is enforced.
ALTER TABLE public.floxov_votes
  ADD COLUMN IF NOT EXISTS voter_id uuid,
  ADD COLUMN IF NOT EXISTS vote smallint,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS changed_at timestamptz;

DO $migration_checks$
DECLARE
  v_table_oid oid := 'public.floxov_votes'::regclass;
  v_voter_attnum smallint;
  v_auth_id_attnum smallint;
  v_pk_count integer;
  v_fk_def_count integer;
  v_check_oid oid;
  v_check_def text;
BEGIN
  SELECT a.attnum INTO v_voter_attnum
  FROM pg_catalog.pg_attribute AS a
  WHERE a.attrelid = v_table_oid AND a.attname = 'voter_id' AND NOT a.attisdropped;

  SELECT a.attnum INTO v_auth_id_attnum
  FROM pg_catalog.pg_attribute AS a
  WHERE a.attrelid = 'auth.users'::regclass AND a.attname = 'id' AND NOT a.attisdropped;

  IF v_voter_attnum IS NULL OR v_auth_id_attnum IS NULL THEN
    RAISE EXCEPTION 'Required voter_id or auth.users.id column is missing. Migration stopped without changing vote rows.';
  END IF;

  IF (SELECT a.atttypid FROM pg_catalog.pg_attribute AS a WHERE a.attrelid = v_table_oid AND a.attname = 'voter_id' AND NOT a.attisdropped) <> 'uuid'::regtype
     OR (SELECT a.atttypid FROM pg_catalog.pg_attribute AS a WHERE a.attrelid = v_table_oid AND a.attname = 'vote' AND NOT a.attisdropped) <> 'smallint'::regtype
     OR (SELECT a.atttypid FROM pg_catalog.pg_attribute AS a WHERE a.attrelid = v_table_oid AND a.attname = 'created_at' AND NOT a.attisdropped) <> 'timestamptz'::regtype
     OR (SELECT a.atttypid FROM pg_catalog.pg_attribute AS a WHERE a.attrelid = v_table_oid AND a.attname = 'changed_at' AND NOT a.attisdropped) <> 'timestamptz'::regtype THEN
    RAISE EXCEPTION 'floxov_votes contains incompatible column types. Inspect the existing schema before continuing.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.floxov_votes WHERE voter_id IS NULL OR vote IS NULL OR created_at IS NULL) THEN
    RAISE EXCEPTION 'floxov_votes contains NULL in a required column. No existing vote was deleted.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.floxov_votes WHERE vote NOT IN (-1, 1)) THEN
    RAISE EXCEPTION 'floxov_votes contains vote values other than -1 and +1. Resolve those rows before continuing.';
  END IF;

  SELECT count(*) INTO v_pk_count
  FROM pg_catalog.pg_constraint AS c
  WHERE c.conrelid = v_table_oid AND c.contype = 'p';

  IF v_pk_count = 0 THEN
    IF EXISTS (SELECT 1 FROM public.floxov_votes GROUP BY voter_id HAVING count(*) > 1) THEN
      RAISE EXCEPTION 'Duplicate voter_id values prevent creation of the primary key.';
    END IF;
    ALTER TABLE public.floxov_votes ADD CONSTRAINT floxov_votes_pkey PRIMARY KEY (voter_id);
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS c
    WHERE c.conrelid = v_table_oid AND c.contype = 'p'
      AND c.conkey = ARRAY[v_voter_attnum]::smallint[]
  ) THEN
    RAISE EXCEPTION 'The existing primary key is not voter_id alone. Migration stopped without dropping it.';
  END IF;

  -- A foreign key on voter_id must reference auth.users(id) with ON DELETE CASCADE.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS c
    WHERE c.conrelid = v_table_oid AND c.contype = 'f'
      AND c.conkey @> ARRAY[v_voter_attnum]::smallint[]
      AND NOT (
        c.conkey = ARRAY[v_voter_attnum]::smallint[]
        AND c.confrelid = 'auth.users'::regclass
        AND c.confkey = ARRAY[v_auth_id_attnum]::smallint[]
        AND c.confdeltype = 'c'
      )
  ) THEN
    RAISE EXCEPTION 'An incompatible foreign key exists on voter_id. Inspect it before continuing.';
  END IF;

  SELECT count(*) INTO v_fk_def_count
  FROM pg_catalog.pg_constraint AS c
  WHERE c.conrelid = v_table_oid AND c.contype = 'f'
    AND c.conkey = ARRAY[v_voter_attnum]::smallint[]
    AND c.confrelid = 'auth.users'::regclass
    AND c.confkey = ARRAY[v_auth_id_attnum]::smallint[]
    AND c.confdeltype = 'c';

  IF v_fk_def_count = 0 THEN
    ALTER TABLE public.floxov_votes
      ADD CONSTRAINT floxov_votes_voter_id_fkey
      FOREIGN KEY (voter_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  SELECT c.oid, pg_catalog.pg_get_constraintdef(c.oid)
    INTO v_check_oid, v_check_def
  FROM pg_catalog.pg_constraint AS c
  WHERE c.conrelid = v_table_oid
    AND c.conname = 'floxov_votes_vote_allowed_values_check'
    AND c.contype = 'c';

  IF v_check_oid IS NULL THEN
    ALTER TABLE public.floxov_votes
      ADD CONSTRAINT floxov_votes_vote_allowed_values_check CHECK (vote IN (-1, 1));
  ELSIF NOT (v_check_def ILIKE '%vote%' AND v_check_def ILIKE '%-1%' AND v_check_def ILIKE '%1%') THEN
    RAISE EXCEPTION 'The named vote CHECK constraint exists but does not match the allowed vote values.';
  END IF;
END
$migration_checks$;

ALTER TABLE public.floxov_votes
  ALTER COLUMN voter_id SET NOT NULL,
  ALTER COLUMN vote SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN changed_at DROP NOT NULL,
  ALTER COLUMN changed_at DROP DEFAULT;

-- The previous FLOXOV migration set changed_at on the initial vote as well.
-- Equal/earlier timestamps therefore represent an initial vote, not a later change.
-- Preserve the vote and its original created_at timestamp while normalizing that marker.
UPDATE public.floxov_votes
SET changed_at = NULL
WHERE changed_at IS NOT NULL AND changed_at <= created_at;

ALTER TABLE public.floxov_votes ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read only their own row. All writes remain RPC-only.
DO $policy_setup$
DECLARE
  v_policy_exists boolean;
  v_policy_qual text;
  v_policy_roles name[];
  v_policy_mode text;
BEGIN
  SELECT true, p.qual, p.roles, p.permissive
    INTO v_policy_exists, v_policy_qual, v_policy_roles, v_policy_mode
  FROM pg_catalog.pg_policies AS p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'floxov_votes'
    AND p.policyname = 'floxov_votes_select_own';

  IF NOT coalesce(v_policy_exists, false) THEN
    CREATE POLICY floxov_votes_select_own
      ON public.floxov_votes
      AS PERMISSIVE
      FOR SELECT
      TO authenticated
      USING (voter_id = (SELECT auth.uid()));
  ELSIF v_policy_qual IS NULL
     OR v_policy_qual NOT ILIKE '%voter_id%'
     OR v_policy_qual NOT ILIKE '%auth.uid%'
     OR coalesce(pg_catalog.array_length(v_policy_roles, 1), 0) <> 1
     OR NOT ('authenticated' = ANY(v_policy_roles))
     OR v_policy_mode <> 'PERMISSIVE' THEN
    RAISE EXCEPTION 'Existing floxov_votes_select_own policy is incompatible. It was not replaced.';
  END IF;

  -- A restrictive policy prevents any pre-existing permissive SELECT policy
  -- from widening visibility beyond the caller's own vote row.
  SELECT true, p.qual, p.roles, p.permissive
    INTO v_policy_exists, v_policy_qual, v_policy_roles, v_policy_mode
  FROM pg_catalog.pg_policies AS p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'floxov_votes'
    AND p.policyname = 'floxov_votes_select_own_restrict';

  IF NOT coalesce(v_policy_exists, false) THEN
    CREATE POLICY floxov_votes_select_own_restrict
      ON public.floxov_votes
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (voter_id = (SELECT auth.uid()));
  ELSIF v_policy_qual IS NULL
     OR v_policy_qual NOT ILIKE '%voter_id%'
     OR v_policy_qual NOT ILIKE '%auth.uid%'
     OR coalesce(pg_catalog.array_length(v_policy_roles, 1), 0) <> 1
     OR NOT ('authenticated' = ANY(v_policy_roles))
     OR v_policy_mode <> 'RESTRICTIVE' THEN
    RAISE EXCEPTION 'Existing floxov_votes_select_own_restrict policy is incompatible. It was not replaced.';
  END IF;
END
$policy_setup$;

REVOKE ALL ON TABLE public.floxov_votes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.floxov_votes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

CREATE OR REPLACE FUNCTION public.get_floxov_reputation()
RETURNS TABLE (
  likes bigint,
  dislikes bigint,
  reputation bigint,
  my_vote smallint,
  can_change_at timestamptz,
  seconds_remaining bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING errcode = '28000';
  END IF;

  RETURN QUERY
  WITH totals AS (
    SELECT
      count(*) FILTER (WHERE v.vote = 1)::bigint AS likes,
      count(*) FILTER (WHERE v.vote = -1)::bigint AS dislikes
    FROM public.floxov_votes AS v
  ), mine AS (
    SELECT
      v.vote,
      coalesce(v.changed_at, v.created_at) + interval '24 hours' AS change_at
    FROM public.floxov_votes AS v
    WHERE v.voter_id = v_uid
  )
  SELECT
    t.likes,
    t.dislikes,
    t.likes - t.dislikes,
    m.vote,
    m.change_at,
    CASE
      WHEN m.change_at IS NULL THEN 0::bigint
      ELSE GREATEST(
        0::numeric,
        pg_catalog.ceil(pg_catalog.date_part('epoch', m.change_at - pg_catalog.statement_timestamp()))
      )::bigint
    END
  FROM totals AS t
  LEFT JOIN mine AS m ON true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.vote_floxov(p_vote smallint)
RETURNS TABLE (
  status text,
  likes bigint,
  dislikes bigint,
  reputation bigint,
  my_vote smallint,
  can_change_at timestamptz,
  seconds_remaining bigint
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_existing public.floxov_votes%ROWTYPE;
  v_status text := 'accepted';
  v_now timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING errcode = '28000';
  END IF;

  IF p_vote IS NULL OR p_vote NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'invalid_vote' USING errcode = '22023';
  END IF;

  -- Serialize concurrent first votes and changes for this Auth identity.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_uid::text, 0)
  );

  -- Take server time after acquiring the per-user lock.
  v_now := pg_catalog.clock_timestamp();

  SELECT v.* INTO v_existing
  FROM public.floxov_votes AS v
  WHERE v.voter_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.floxov_votes (voter_id, vote, created_at, changed_at)
    VALUES (v_uid, p_vote, v_now, NULL);
  ELSIF v_existing.vote = p_vote THEN
    -- Repeating the same vote is a no-op and never restarts the cooldown.
    v_status := 'unchanged';
  ELSIF v_now < coalesce(v_existing.changed_at, v_existing.created_at) + interval '24 hours' THEN
    v_status := 'cooldown';
  ELSE
    UPDATE public.floxov_votes AS v
    SET vote = p_vote,
        changed_at = v_now
    WHERE v.voter_id = v_uid;
  END IF;

  RETURN QUERY
  WITH totals AS (
    SELECT
      count(*) FILTER (WHERE v.vote = 1)::bigint AS likes,
      count(*) FILTER (WHERE v.vote = -1)::bigint AS dislikes
    FROM public.floxov_votes AS v
  ), mine AS (
    SELECT
      v.vote,
      coalesce(v.changed_at, v.created_at) + interval '24 hours' AS change_at
    FROM public.floxov_votes AS v
    WHERE v.voter_id = v_uid
  )
  SELECT
    v_status,
    t.likes,
    t.dislikes,
    t.likes - t.dislikes,
    m.vote,
    m.change_at,
    CASE
      WHEN m.change_at IS NULL THEN 0::bigint
      ELSE GREATEST(
        0::numeric,
        pg_catalog.ceil(pg_catalog.date_part('epoch', m.change_at - pg_catalog.clock_timestamp()))
      )::bigint
    END
  FROM totals AS t
  LEFT JOIN mine AS m ON true;
END;
$function$;

-- The functions run as postgres and expose only aggregate counts/current caller state.
ALTER FUNCTION public.get_floxov_reputation() OWNER TO postgres;
ALTER FUNCTION public.vote_floxov(smallint) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.get_floxov_reputation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.vote_floxov(smallint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_floxov_reputation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.vote_floxov(smallint) TO authenticated;

COMMENT ON TABLE public.floxov_votes IS
  'One active reputation vote per Supabase Auth identity. Vote changes are limited to 24 hours.';
COMMENT ON FUNCTION public.get_floxov_reputation() IS
  'Returns global like/dislike totals and the authenticated caller vote state without exposing other voter identities.';
COMMENT ON FUNCTION public.vote_floxov(smallint) IS
  'Creates or changes the authenticated caller vote with a server-enforced 24-hour cooldown.';

COMMIT;
