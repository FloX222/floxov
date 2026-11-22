/* FLOXOV Supabase client bootstrap.
 * Uses the existing public project configuration from assets/config.js.
 * Keeps the existing session storage key so returning visitors keep their vote identity.
 */
let clientPromise = null;

export async function createFloxovSupabaseClient() {
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    const reputationConfig = window.FLOXOV_CONFIG?.reputation ?? {};
    const supabaseUrl = typeof reputationConfig.supabaseUrl === "string"
      ? reputationConfig.supabaseUrl.trim().replace(/\/$/, "")
      : "";
    const supabaseKey = typeof reputationConfig.supabaseAnonKey === "string"
      ? reputationConfig.supabaseAnonKey.trim()
      : "";

    if (!supabaseUrl || !supabaseKey) {
      const error = new Error("FLOXOV Supabase URL or public key is missing in assets/config.js.");
      error.code = "FLOXOV_SUPABASE_CONFIG_MISSING";
      throw error;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(supabaseUrl);
    } catch (_) {
      const error = new Error("FLOXOV Supabase URL is not a valid URL.");
      error.code = "FLOXOV_SUPABASE_INVALID_URL";
      throw error;
    }

    // Reject unexpected backends. Do not allow the public key to be sent to arbitrary hosts.
    if ((parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") ||
        (parsedUrl.hostname !== "localhost" && !/^[a-z0-9-]+\.supabase\.co$/i.test(parsedUrl.hostname)) ||
        parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
      const error = new Error("FLOXOV Supabase URL must use HTTPS.");
      error.code = "FLOXOV_SUPABASE_INVALID_URL";
      throw error;
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.119.2");
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: "floxov-reputation-session"
      }
    });
  })();

  try {
    return await clientPromise;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}

export async function ensureFloxovAnonymousSession(client) {
  if (!client) throw new Error("Supabase client is not initialized.");

  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (data?.session?.user) return data.session;

  // Optional Cloudflare Turnstile: the site key is public, the secret remains in Supabase.
  // This must be enabled in BOTH assets/config.js and Supabase Auth settings.
  const captchaSiteKey = window.FLOXOV_CONFIG?.reputation?.turnstileSiteKey?.trim() || "";
  const captchaToken = captchaSiteKey ? await requestTurnstileToken(captchaSiteKey) : "";
  const signIn = await client.auth.signInAnonymously(
    captchaToken ? { options: { captchaToken } } : undefined
  );
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user) {
    throw new Error("Supabase did not return an anonymous session.");
  }
  return signIn.data.session;
}


/** Obtain one challenge token before creating a new anonymous identity. */
async function requestTurnstileToken(siteKey) {
  if (!/^[\w-]{8,150}$/.test(siteKey)) {
    throw new Error("Invalid public Turnstile site key.");
  }
  if (!window.turnstile) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Turnstile failed to load."));
      document.head.append(script);
    });
  }
  if (!window.turnstile?.render) throw new Error("Turnstile is unavailable.");

  const language = document.documentElement.lang === "ru" ? "ru" : "en";
  const overlay = document.createElement("div");
  overlay.className = "floxov-verification-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", language === "ru" ? "Проверка безопасности" : "Security verification");
  const panel = document.createElement("div");
  panel.className = "floxov-verification-panel";
  const heading = document.createElement("p");
  heading.textContent = language === "ru" ? "Подтвердите, что вы человек" : "Verify you're human";
  const mount = document.createElement("div");
  panel.append(heading, mount);
  overlay.append(panel);
  document.body.append(overlay);
  let widgetId;
  let timeout;
  try {
    return await new Promise((resolve, reject) => {
      let settled = false;
      const complete = (error, token) => {
        if (settled) return;
        settled = true;
        error ? reject(error) : resolve(token);
      };
      timeout = window.setTimeout(() => complete(new Error("Turnstile verification timed out.")), 120000);
      widgetId = window.turnstile.render(mount, {
        sitekey: siteKey,
        theme: "dark",
        callback: token => complete(null, token),
        "error-callback": () => complete(new Error("Turnstile verification failed.")),
        "expired-callback": () => complete(new Error("Turnstile token expired."))
      });
    });
  } finally {
    window.clearTimeout(timeout);
    if (widgetId !== undefined) {
      try { window.turnstile.remove(widgetId); } catch (_) { /* no-op */ }
    }
    overlay.remove();
  }
}
