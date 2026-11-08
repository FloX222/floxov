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

    if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
      const error = new Error("FLOXOV Supabase URL must use HTTPS.");
      error.code = "FLOXOV_SUPABASE_INVALID_URL";
      throw error;
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
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

  const signIn = await client.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user) {
    throw new Error("Supabase did not return an anonymous session.");
  }
  return signIn.data.session;
}
