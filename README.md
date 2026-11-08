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

The homepage includes a bilingual minimal reputation widget with centered score and `+` / `−` voting controls. Live voting is intentionally disabled until Supabase is configured; the page does not create fake local votes.

To enable it:

1. Create a Supabase project.
2. Enable **Anonymous Sign-Ins** in Authentication settings.
3. Run `supabase/migrations/202611080001_floxov_reputation.sql` in the Supabase SQL Editor.
4. Copy the Project URL and the public anon/publishable key into `reputation.supabaseUrl` and `reputation.supabaseAnonKey` in `assets/config.js`. Never use the service-role key in the website.
5. Deploy the site over HTTPS and test with two separate browser profiles.

The database stores one active vote per Supabase anonymous identity. The database enforces the 24-hour change cooldown using server time and returns only aggregate counts plus the current visitor's own vote. Anonymous identity is persistent in the browser, but it cannot prove one real-world person equals one vote if someone deliberately clears browser identity or creates multiple accounts.

See `SUPABASE_SETUP.md` for setup and security notes.

## Video source quality

The supplied replacement MP4 uploads in the latest handoff are 910×512 at 30 FPS. The project already contained matching Flipper Zero animations at 1920×1080 and 60 FPS, so the higher-quality originals in `assets/flipper-dark.mp4` and `assets/flipper-light.mp4` were retained rather than replacing them with lower-resolution copies.

## Latest visual refinement

- The avatar remains the original square `assets/floxov.png`. Hover, keyboard focus, and touch trigger a brief CSS-based CRT/VHS glitch sequence; the reference clip is used only as a motion reference and is not embedded as the avatar.
- The reputation widget displays only the centered score and `+` / `−` controls. Vote persistence and the 24-hour change restriction remain server-side through the existing Supabase RPC functions.
- The Flipper Zero MP4s are composited to the actual dark/light theme canvas colors, with matching poster frames, so there is no separate contrasting video rectangle. Both are 1920×1080, 60 FPS, 10 seconds, H.264, and silent.
- The newest standalone video uploads were 910×512 at 30 FPS. The project already contained matching 1920×1080, 60 FPS source versions, so those higher-resolution versions were retained and refined instead of replacing them with lower-resolution files. The white version received light temporal denoising and restrained sharpening.
- The light theme background is `#f4f4ef`, matching the decoded light-video canvas to avoid a visible edge between the hero video and the page.


## Reputation system — implementation and deployment

The reputation widget uses Supabase Anonymous Auth and PostgreSQL RPC functions. Configure the project URL and public anon/publishable key in `assets/config.js`, enable Anonymous Sign-Ins, and apply `supabase/migrations/202611080001_floxov_reputation.sql`.

The database stores one active vote per anonymous Supabase identity. First votes are immediate; vote changes are limited to once per 24 hours. The `voter_id` is obtained from `auth.uid()` inside PostgreSQL. Direct table privileges are revoked from browser roles; frontend calls use only `get_floxov_reputation()` and `vote_floxov(p_vote)`.

Run `supabase/VERIFY_FLOXOV_REPUTATION.sql` in the Supabase SQL Editor after applying the migration. Then complete browser-authenticated functional tests described in `SUPABASE_SETUP.md`. SQL Editor execution does not simulate an authenticated visitor.

**Deployment status:** source files and migration are packaged, but no live Supabase project was connected or modified during this build. No live database test is claimed. Anonymous Auth is session-based and does not guarantee one vote per real person.
