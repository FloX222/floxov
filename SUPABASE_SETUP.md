# FLOXOV Reputation — Supabase Deployment

This package contains the website integration and PostgreSQL migration. The migration is prepared locally, but it has **not** been applied to a live Supabase project because no project credentials or owner access were supplied.

## 1. Create or select a Supabase project

1. Open the Supabase dashboard and create a project, or select the existing FLOXOV project.
2. Wait until the database is ready.
3. Open **Authentication → Sign In / Providers** (the exact menu label can vary) and enable **Anonymous Sign-Ins**.
4. If anonymous sign-in is disabled, the website cannot create visitor sessions.

## 2. Apply the database migration

1. Open **SQL Editor** in the selected project.
2. Open `supabase/migrations/202611080001_floxov_reputation.sql` from this archive.
3. Paste the complete file into a new SQL query and run it.
4. Do not run a manual `DROP TABLE`, delete auth users, or truncate votes.
5. If the migration stops with an incompatibility message, stop and inspect the existing schema. The migration intentionally refuses to silently discard incompatible vote data.

The migration creates or upgrades `public.floxov_votes`, enables RLS, removes direct table privileges from `anon` and `authenticated`, and grants those roles access only to the two required RPCs (authenticated only).

## 3. Verify database structure and permissions

1. Open `supabase/VERIFY_FLOXOV_REPUTATION.sql`.
2. Run it in SQL Editor using the project owner context.
3. Every row in the first result set should show `PASS`.
4. Inspect the function metadata result: both functions should show `security_definer = true` and `search_path={}`.
5. The final result set reports aggregate totals only.

This SQL Editor check verifies schema and grants. It does **not** impersonate an authenticated browser visitor, so it cannot prove that `auth.uid()` is populated in a real request.

## 4. Configure the website's public Supabase credentials

In Supabase, open **Project Settings → API** (or the API keys section in the current dashboard) and copy:

- Project URL, for example `https://YOUR_PROJECT_REF.supabase.co`
- The public `anon` key or public publishable key supported by your project.

Edit `assets/config.js`:

```js
reputation: {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
},
```

These are public browser credentials. **Never** put a `service_role` or secret key in `assets/config.js`, HTML, JavaScript, or any other publicly deployed file. The archive deliberately contains placeholders, not invented credentials.

## 5. Deploy and test the website

Deploy the complete folder to an HTTPS static host. Then test:

1. Open the site in a clean browser profile. The widget should initialize an anonymous Supabase session and load current totals.
2. Submit `+`. The global likes and reputation should increase by one and the selected vote should be restored after refresh.
3. Submit `+` again. The response should be `unchanged`; no duplicate row should be created.
4. Submit `−` before the 24-hour window ends. The response should be `cooldown`, with the server-provided remaining time displayed.
5. After the full cooldown, submit `−`. The existing row should be updated, not duplicated.
6. Open a second clean browser profile. It should have a separate anonymous identity and see the same global totals.
7. In browser DevTools → Network, inspect the RPC calls. They should call `get_floxov_reputation` and `vote_floxov`, not directly read or write `floxov_votes`.
8. Confirm that direct REST table access using the public key returns a permission error.

For simultaneous-request testing, send two `vote_floxov` RPC requests concurrently from the **same authenticated browser session**. Confirm there is still only one row for that user's UUID. A pair of separate anonymous sessions is not a valid race test for one identity.

## 6. Expected behavior and security model

- One row per Supabase Auth user is enforced by the `voter_id` primary key.
- `auth.uid()` supplies the voter identity. The browser never submits `voter_id`.
- The first vote is accepted immediately.
- A visitor may change the vote only after 24 hours from the first vote or the last successful change.
- Repeating the same vote returns `unchanged` and does not update timestamps.
- `created_at` is set on first vote. `changed_at` remains `NULL` until a successful vote change, then records that change time.
- Reputation is calculated from the vote rows on the server: likes minus dislikes.
- `seconds_remaining` is computed by PostgreSQL. The browser countdown is only a display; it is not a security control.

Anonymous authentication identifies a Supabase session, **not a verified human**. Clearing site storage, using another browser/device, or creating another anonymous account can produce another identity. This system enforces one vote per anonymous Auth identity, not one vote per physical person.

For stronger abuse resistance, add Cloudflare Turnstile or another CAPTCHA with **server-side token verification** in a trusted Edge Function or backend before allowing vote RPC execution. Do not trust a client-side CAPTCHA result. Additional IP/device rate limiting may help, but must account for shared networks and privacy requirements.

## 7. Troubleshooting

| Symptom | Check |
|---|---|
| “Voting is unavailable…” | Set both public values in `assets/config.js`. |
| Anonymous sign-in fails | Enable Anonymous Sign-Ins; check Supabase Auth settings and allowed URLs. |
| `authentication_required` | Ensure the browser has a valid anonymous session and is calling the RPC as `authenticated`. |
| RPC returns 404 / function not found | Apply the migration to the correct project and verify the exact function names/signatures. |
| Permission denied | Run the verification SQL; check function grants and that the caller has an authenticated JWT. |
| CORS/network error | Check the project URL, browser network access, HTTPS hosting, and Supabase project status. |
| Votes do not persist | Inspect the RPC response and Supabase logs; do not infer success from the button click alone. |

## 8. Future schema updates

- Add a new, timestamped migration file; do not edit an already deployed migration in place.
- Test upgrades against a staging Supabase project containing representative existing vote rows.
- Run `VERIFY_FLOXOV_REPUTATION.sql` after each deployment.
- Back up the database before any migration that changes or removes data.
- Never remove `floxov_votes` or Auth users as a troubleshooting shortcut.
