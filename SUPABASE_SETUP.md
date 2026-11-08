# FLOXOV reputation backend

This file is retained as a short compatibility pointer. The complete beginner-friendly instructions are in [`README_SETUP_RU.md`](README_SETUP_RU.md).

The system is designed for the **existing** FLOXOV Supabase project and the already-published GitHub Pages website. Do not create another Supabase project.

1. Confirm Anonymous Sign-Ins is enabled in Authentication → Sign In / Providers.
2. Keep the existing Project URL and public Publishable / anon key in `assets/config.js`. If the current repository already has values, do not replace them.
3. Run `FLOXOV_REPUTATION_MIGRATION.sql` in the existing project's SQL Editor. This migration preserves existing vote rows and makes `changed_at` nullable.
4. Run `FLOXOV_REPUTATION_VERIFY.sql`. It is read-only; critical checks should all report PASS.
5. Add `assets/supabase.js` and replace `assets/reputation.js` in the existing repository. The current `index.html` already loads `reputation.js` as a module.
6. Deploy using the repository's existing GitHub Pages settings and follow the two-session test checklist in `README_SETUP_RU.md`.

The SQL migration changes the database. The verification script only reads metadata and aggregate counts. The system is not production-verified until the migration and browser tests have been completed in the actual project.
