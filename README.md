# FLOXOV — Premium Personal Website

A responsive, bilingual personal website built with vanilla HTML, CSS, and JavaScript. The current experience is intentionally focused on three elements: the Home / Hero section, Contact section, and a minimal footer.

## Run locally

No build step or package installation is required.

1. Extract the project folder.
2. For reliable testing, start a local HTTP server from this folder (do not use the iPhone Files HTML preview, which may block sibling CSS/JS/assets):

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` on the computer. To test on iPhone, publish the folder to an HTTPS host such as Netlify, or access the computer server through its local network IP while both devices are on the same Wi-Fi.

## Structure

- `index.html` — Home / Hero, Contact, and Footer.
- `about.html` — legacy URL that redirects to `index.html#contact`.
- `projects.html` — compatibility redirect to the homepage; Projects is intentionally absent from navigation.
- `assets/styles.css` — design system, dark/light themes, responsive layouts, and motion.
- `assets/main.js` — language/theme controls, navigation, profile image setup, contact rendering, and progressive enhancements.
- `assets/reputation.js` — optional Supabase-powered reputation widget and 24-hour vote cooldown.
- `assets/config.js` — editable profile image, theme video, reputation backend, and contact configuration.
- `supabase/migrations/` — database migration for secure reputation voting.
- `assets/floxov.png` — the original square FLOXOV avatar used by the homepage.
- `assets/profile.jpg` — retained legacy image asset; it is not the configured homepage avatar.
- `assets/favicon.png` — browser icon.
- `assets/og-image.png` and `assets/og-image.svg` — social-sharing artwork.

## Configure the profile avatar

The original square avatar is configured in `assets/config.js`:

```js
profile: {
  name: "FLOXOV",
  image: "assets/floxov.png",
  imagePosition: "50% 50%",
  imageFit: "cover",
  aspectRatio: "1 / 1"
},
```

The homepage uses the original `assets/floxov.png` avatar. It is already square (1:1), and the frame uses `object-fit: cover`. Change `profile.image` only if you intentionally want to use another image.

To use a different filename, update `profile.image`. Adjust the crop with `imagePosition`, for example `"50% 35%"`. The image uses `object-fit: cover`.

## Contact configuration

The Telegram and Discord channel entries are in `assets/config.js`. Both currently use the username `Floxov`.

Each contact card is a semantic button that copies its configured username to the clipboard. A localized toast confirms success or reports a copy failure. No profile URLs or account identifiers are fabricated.

## Languages

The site supports English and Russian. All visible interface copy, contact-card accessibility labels, and clipboard feedback are localized in the `en` and `ru` dictionaries in `assets/main.js`. The selected language is stored in localStorage, and the document language and SEO metadata update with it.

## Themes

Dark and light themes use CSS variables in `assets/styles.css`. The first visit follows the operating-system preference; a manual choice is saved in localStorage.

## Before publishing

- Confirm `assets/floxov.png` is the intended square profile avatar.
- Verify that all displayed contact identifiers are correct.
- Set the production domain and canonical metadata when the final domain is known.
- The website is static and does not include a backend contact form.

## Accessibility and performance

- Semantic landmarks and heading hierarchy.
- Keyboard-accessible navigation and visible focus states.
- Responsive mobile navigation and copy-to-clipboard contact controls.
- `prefers-reduced-motion` support.
- Image fallback styling if the profile photograph is unavailable.
- Lightweight CSS transforms and progressive reveal animations.


## Customize the header logo, profile avatar, and contact video

All three visual assets are configured in `assets/config.js`. Upload your files into the `assets/` folder and change only the paths in this configuration.

### Header logo

```js
brand: {
  logoImage: "assets/my-logo.svg", // SVG, PNG, JPG, or WebP
  logoAlt: "FLOXOV logo",
  logoSize: 34,
  showName: true // false if the uploaded logo already includes the FLOXOV wordmark
},
```

Leave `logoImage: ""` to use the original diamond-shaped F mark. The uploaded image replaces that mark; it does not change the rest of the navigation.

### Square profile avatar

```js
profile: {
  name: "FLOXOV",
  image: "assets/my-avatar.webp",
  imagePosition: "50% 50%",
  imageFit: "cover",
  aspectRatio: "1 / 1"
},
```

Use `imagePosition` to adjust the crop. Keep `aspectRatio: "1 / 1"` for a square image, or use `"4 / 5"` for a portrait frame. `imageFit: "cover"` fills the frame; `"contain"` shows the entire image.

### Animated contact-section background

```js
contact: {
  backgroundVideo: "./assets/background.mp4",
  backgroundPoster: "assets/contact-poster.jpg",
  videoOverlayDark: 0.66,
  videoOverlayLight: 0.78,
  // Keep your existing email and channels configuration below.
},
```

Use an optimized MP4 encoded with H.264 or a WebM file. Keep the video muted and without audio; the player is configured for autoplay, loop, and inline playback on mobile. Add a poster image so the contact section still looks intentional while the video loads or when autoplay is blocked. If both paths are empty, the original graphite gradient is used. Browsers may block autoplay or defer it when reduced motion or data-saving is enabled; the poster image remains visible. The overlay opacity can be set from `0` (video clearly visible) to `1` (fully covered for maximum text contrast). For mobile, aim for a short 6–12 second loop, 720p or 1080p, H.264, and a modest bitrate to avoid excessive data usage.


## Customize the hero cover and header logo

Both assets are configured in `assets/config.js`.

### Main hero video background

The homepage hero now uses two separate Flipper Zero videos, selected automatically by the existing theme preference.

```js
heroThemeVideos: {
  dark: "assets/flipper-dark.mp4",
  light: "assets/flipper-light.mp4",
  darkPoster: "assets/flipper-dark-poster.webp",
  lightPoster: "assets/flipper-light-poster.webp",
  transitionDuration: 450
},
```

- `dark` is shown when `data-theme="dark"`.
- `light` is shown when `data-theme="light"`.
- The two videos crossfade over the configured transition duration.
- Both videos are muted, looped, and played inline on mobile.
- The poster images are used while loading, when autoplay is blocked, and when reduced motion is enabled.

Keep the two video files at the same duration and frame rate so their playback positions remain synchronized when the visitor switches themes. The existing `heroMedia` and `profile.image` configuration entries are retained for compatibility and are not used by the Flipper Zero hero stage.

### Header logo

The header uses the existing FLOXOV favicon artwork, optimized as `assets/brand-logo.webp`. Replace `brand.logoImage` with your own local asset path:

```js
brand: {
  logoImage: "assets/brand-logo.webp", // Example: "assets/my-logo.svg"
  logoAlt: "FLOXOV brand mark",
  logoSize: 34,
  showName: true
},
```

Supported logo formats include SVG, PNG, JPG, and WebP. If the logo path is empty or the file cannot load, the geometric F mark is not displayed; the FLOXOV wordmark remains visible.

The theme selector uses a Sun/Moon segmented pill. The EN/RU selector uses a matching segmented control. Both preserve their existing localStorage keys (`floxov-theme` and `floxov-language`).


## Homepage Flipper Zero Background

The homepage hero now uses a full-bleed, theme-aware Flipper Zero video background. The dark theme plays `assets/flipper-dark.mp4`; the light theme plays `assets/flipper-light.mp4`. The existing theme toggle controls the crossfade automatically. The original FLOXOV profile/avatar tile is restored in the foreground and continues to load from `assets/floxov.png`. Both video layers are muted, autoplay, loop, and play inline.


## FLOXOV reputation system

The homepage includes a bilingual Like / Dislike widget. Its existing HTML and CSS are preserved. The frontend uses `assets/supabase.js` for the Supabase client and `assets/reputation.js` for UI state, anonymous-session initialization, RPC calls, cooldown display, and global-stat refresh.

### Existing Supabase project

Use the Supabase project already connected to the published website. Do not create a replacement project. Verify that **Authentication → Sign In / Providers → Anonymous Sign-Ins** is enabled. The frontend reads the Project URL and public Publishable / legacy anon key from `reputation.supabaseUrl` and `reputation.supabaseAnonKey` in `assets/config.js`. Keep any values already present in the current GitHub repository. Current Dashboard paths: use the project's **Connect** dialog for Project URL and **Project Settings → API Keys** to inspect keys. Anonymous Auth users use the PostgreSQL `authenticated` role, so the RPC grants and RLS policy target `authenticated` rather than `anon` ([Supabase Anonymous Sign-Ins docs](https://supabase.com/docs/guides/auth/auth-anonymous), [API Keys docs](https://supabase.com/docs/guides/getting-started/api-keys)).

### Files

- `assets/supabase.js` — creates the Supabase JS client and reuses the existing `floxov-reputation-session` browser session key.
- `assets/reputation.js` — initializes anonymous auth, reads global stats, submits Like/Dislike RPC calls, renders the current user's vote and countdown, and refreshes global totals while the page is visible.
- `FLOXOV_REPUTATION_MIGRATION.sql` — database-changing, repeatable migration for the existing project.
- `FLOXOV_REPUTATION_VERIFY.sql` — read-only schema, RLS, permissions, function, and aggregate verification.
- `FLOXOV_REPUTATION_BASELINE_50.sql` — safe upgrade for an existing Supabase project; sets the starting reputation to 50 without deleting votes.
- `supabase/migrations/202611080002_floxov_reputation_upgrade.sql` — versioned copy of the migration.
- `README_SETUP_RU.md` — beginner-friendly setup and test guide in Russian.

### Database model and behavior

`public.floxov_votes` stores one current row per Supabase Auth user:

| Column | Type | Meaning |
|---|---|---|
| `voter_id` | `uuid` | Primary key and FK to `auth.users(id)` |
| `vote` | `smallint` | `1` for Like, `-1` for Dislike |
| `created_at` | `timestamptz` | Time of the first vote |
| `changed_at` | `timestamptz NULL` | Time of the latest successful change; NULL until the first change |

The cooldown anchor is `coalesce(changed_at, created_at) + interval '24 hours'`. Repeating the same vote returns `unchanged` and never modifies either timestamp. A different vote before the cooldown expires returns `cooldown`. A successful change updates `vote` and `changed_at` in one transaction.

`vote_floxov(p_vote smallint)` validates the caller and input, serializes concurrent requests with a per-user transaction advisory lock, and returns `accepted`, `unchanged`, or `cooldown` together with the updated global totals and current caller state.

`get_floxov_reputation()` returns global likes, dislikes, reputation (`50 + likes - dislikes`), the caller's own vote, the next change time, and remaining seconds. It does not return other voter IDs.

Both RPC functions are `SECURITY DEFINER`, owned by `postgres`, use an empty fixed `search_path`, and fully qualify application table references. RLS is enabled. Authenticated users may directly read only their own row; direct INSERT/UPDATE/DELETE are revoked. Voting and aggregate statistics are exposed through the two RPC functions only.

### Apply and verify

1. For an already-running FLOXOV site, run `FLOXOV_REPUTATION_BASELINE_50.sql` in SQL Editor of the existing Supabase project. It replaces only the RPC functions and preserves every existing vote and cooldown timestamp. For a fresh setup, use `FLOXOV_REPUTATION_MIGRATION.sql` instead.
2. Run `FLOXOV_REPUTATION_VERIFY.sql`. It is read-only; every critical check should report `PASS`.
3. Add/replace `assets/supabase.js` and `assets/reputation.js` in the existing GitHub Pages repository. Preserve the current `assets/config.js` values.
4. Follow `README_SETUP_RU.md` to test anonymous auth, first votes, repeated votes, cooldown, refresh persistence, two browser sessions, RPC grants, RLS, and mobile layout.

The migration and frontend are implemented, but the system should not be described as production-verified until the SQL is run against the actual Supabase project and the browser test checklist passes.

## Video source quality

The supplied replacement MP4 uploads in the latest handoff are 910×512 at 30 FPS. The project already contained matching Flipper Zero animations at 1920×1080 and 60 FPS, so the higher-quality originals in `assets/flipper-dark.mp4` and `assets/flipper-light.mp4` were retained rather than replacing them with lower-resolution copies.


### Starting reputation

The FLOXOV reputation widget now starts at **50**. The server calculates the score as `50 + likes - dislikes`. Every active Like contributes `+1`, and every active Dislike contributes `-1`. A user can change their choice only after 24 hours; repeating the same choice has no effect and does not restart the timer. If a user switches from Like to Dislike after the cooldown, the previous `+1` is removed and the new `-1` is applied, so the net score changes by `-2`.
