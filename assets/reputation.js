/* FLOXOV reputation widget: Supabase Anonymous Auth + server-enforced voting. */
(() => {
  "use strict";

  const widget = document.querySelector("[data-reputation-widget]");
  if (!widget) return;

  const config = window.FLOXOV_CONFIG?.reputation || {};
  const buttons = [...widget.querySelectorAll("[data-reputation-vote]")];
  const scoreNode = widget.querySelector("[data-reputation-score]");
  const likesNode = widget.querySelector("[data-reputation-likes]");
  const dislikesNode = widget.querySelector("[data-reputation-dislikes]");
  const statusNode = widget.querySelector("[data-reputation-status]");
  const cooldownNode = widget.querySelector("[data-reputation-cooldown]");
  const toast = document.querySelector("[data-reputation-toast]");

  const messages = {
    en: {
      unavailable: "Voting is unavailable until the backend is configured.",
      loading: "Connecting to reputation service…",
      firstVote: "Cast your first vote. You can change it after 24 hours.",
      saved: "Your vote has been recorded.",
      cooldownTitle: "Vote change unavailable",
      cooldownBody: "You can change your vote again in",
      loadError: "Could not load reputation. Please try again later.",
      saveError: "Your vote could not be saved. Please try again.",
      connectionError: "Could not connect to the voting service.",
      hour: "h", minute: "m", second: "s"
    },
    ru: {
      unavailable: "Голосование станет доступно после настройки сервера.",
      loading: "Подключаем систему репутации…",
      firstVote: "Оставьте первый голос. Изменить его можно будет через 24 часа.",
      saved: "Ваш голос учтён.",
      cooldownTitle: "Изменение голоса пока недоступно",
      cooldownBody: "Изменить голос можно через",
      loadError: "Не удалось загрузить репутацию. Попробуйте позже.",
      saveError: "Не удалось сохранить голос. Попробуйте ещё раз.",
      connectionError: "Не удалось подключиться к системе голосования.",
      hour: "ч", minute: "мин", second: "с"
    }
  };

  let language = document.documentElement.dataset.language === "ru" ? "ru" : "en";
  let client = null;
  let busy = false;
  let currentVote = null;
  let cooldownDeadline = 0;
  let countdownTimer = 0;
  let toastTimer = 0;
  let activeToast = "";
  let activeToastSeconds = 0;
  let lastStatus = "unavailable";
  let operationFailed = false;

  const tr = (key) => messages[language][key] || messages.en[key] || key;
  const unwrap = (data) => Array.isArray(data) ? data[0] : data;
  const setStatus = (message, kind = "") => {
    if (!statusNode) return;
    statusNode.textContent = message || "";
    if (kind) statusNode.dataset.kind = kind;
    else delete statusNode.dataset.kind;
  };
  const formatDuration = (value) => {
    const total = Math.max(0, Math.ceil(Number(value) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours) return `${hours}${tr("hour")} ${String(minutes).padStart(2, "0")}${tr("minute")}`;
    if (minutes) return `${minutes}${tr("minute")} ${String(seconds).padStart(2, "0")}${tr("second")}`;
    return `${seconds}${tr("second")}`;
  };
  const renderVote = () => {
    buttons.forEach((button) => {
      const selected = currentVote !== null && Number(button.dataset.reputationVote) === currentVote;
      button.dataset.selected = String(selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };
  const setBusy = (value) => {
    busy = value;
    buttons.forEach((button) => { button.disabled = value || !client; });
    widget.classList.toggle("is-loading", value);
  };
  const showToast = (type, seconds = 0) => {
    if (!toast) return;
    activeToast = type;
    activeToastSeconds = Math.max(0, Number(seconds) || 0);
    const text = () => {
      if (activeToast === "cooldown") return `${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(activeToastSeconds)}.`;
      if (activeToast === "error") return tr("saveError");
      return activeToast === "saved" ? tr("saved") : "";
    };
    window.clearTimeout(toastTimer);
    toast.textContent = text();
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => { toast.hidden = true; activeToast = ""; }, 240);
    }, 4200);
    return text;
  };
  const setCooldown = (seconds) => {
    window.clearInterval(countdownTimer);
    const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
    cooldownDeadline = safe ? Date.now() + safe * 1000 : 0;
    if (!cooldownNode) return;
    if (!safe) {
      cooldownNode.hidden = true;
      cooldownNode.textContent = "";
      return;
    }
    cooldownNode.hidden = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownDeadline - Date.now()) / 1000));
      if (!remaining) {
        window.clearInterval(countdownTimer);
        cooldownNode.hidden = true;
        cooldownNode.textContent = "";
        if (lastStatus === "cooldown" || lastStatus === "cooldown-active") {
          lastStatus = "saved";
          setStatus(tr("saved"), "success");
        }
        return;
      }
      cooldownNode.textContent = `${tr("cooldownBody")} ${formatDuration(remaining)}.`;
      if (lastStatus === "cooldown") {
        setStatus(`${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(remaining)}.`, "error");
      }
      if (activeToast === "cooldown" && toast && !toast.hidden) {
        activeToastSeconds = remaining;
        toast.textContent = `${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(remaining)}.`;
      }
    };
    tick();
    countdownTimer = window.setInterval(tick, 1000);
  };
  const applyStats = (row) => {
    if (!row) throw new Error("Empty reputation response.");
    const likes = Number(row.likes);
    const dislikes = Number(row.dislikes);
    const reputation = Number(row.reputation);
    if (![likes, dislikes, reputation].every(Number.isFinite)) {
      throw new Error("Invalid reputation response.");
    }
    if (likesNode) likesNode.textContent = String(likes);
    if (dislikesNode) dislikesNode.textContent = String(dislikes);
    if (scoreNode) {
      scoreNode.textContent = reputation > 0 ? `+${reputation}` : String(reputation);
      scoreNode.classList.remove("is-updated");
      requestAnimationFrame(() => scoreNode.classList.add("is-updated"));
    }
    currentVote = row.my_vote === null || row.my_vote === undefined ? null : Number(row.my_vote);
    if (currentVote !== null && currentVote !== 1 && currentVote !== -1) {
      throw new Error("Invalid current vote in response.");
    }
    renderVote();
    setCooldown(row.seconds_remaining);
  };
  const refresh = async () => {
    const { data, error } = await client.rpc("get_floxov_reputation");
    if (error) throw error;
    const row = unwrap(data);
    applyStats(row);
    if (currentVote === null) {
      lastStatus = "firstVote";
      setStatus(tr("firstVote"));
    } else if (Number(row.seconds_remaining) > 0) {
      lastStatus = "cooldown-active";
      setStatus("");
    } else {
      lastStatus = "saved";
      setStatus(tr("saved"), "success");
    }
  };
  const submitVote = async (vote) => {
    if (!client || busy || ![-1, 1].includes(vote)) return;
    setBusy(true);
    try {
      const { data, error } = await client.rpc("vote_floxov", { p_vote: vote });
      if (error) throw error;
      const row = unwrap(data);
      if (!row || !["accepted", "unchanged", "cooldown"].includes(row.status)) {
        throw new Error("Unexpected vote RPC response.");
      }
      applyStats(row);
      operationFailed = false;
      if (row.status === "cooldown") {
        lastStatus = "cooldown";
        setStatus(`${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(row.seconds_remaining)}.`, "error");
        showToast("cooldown", row.seconds_remaining);
      } else if (row.status === "unchanged") {
        lastStatus = Number(row.seconds_remaining) > 0 ? "cooldown-active" : "saved";
        setStatus(tr("saved"), "success");
      } else {
        lastStatus = "saved";
        setStatus(tr("saved"), "success");
        showToast("saved");
      }
    } catch (error) {
      console.error("FLOXOV reputation vote failed:", error);
      operationFailed = true;
      lastStatus = "error";
      setStatus(tr("saveError"), "error");
      showToast("error");
      // Re-fetch server state after an ambiguous network failure.
      try { await refresh(); } catch (refreshError) {
        console.error("FLOXOV reputation recovery failed:", refreshError);
        setStatus(tr("saveError"), "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const updateLanguage = () => {
    language = document.documentElement.dataset.language === "ru" ? "ru" : "en";
    const remaining = cooldownDeadline ? Math.max(0, Math.ceil((cooldownDeadline - Date.now()) / 1000)) : 0;
    if (!client) setStatus(tr("unavailable"));
    else if (lastStatus === "cooldown" && remaining) {
      setStatus(`${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(remaining)}.`, "error");
    } else if (operationFailed) setStatus(tr("saveError"), "error");
    else if (lastStatus === "firstVote") setStatus(tr("firstVote"));
    else if (lastStatus === "saved") setStatus(tr("saved"), "success");
    if (cooldownNode && remaining) cooldownNode.textContent = `${tr("cooldownBody")} ${formatDuration(remaining)}.`;
    if (toast && !toast.hidden && activeToast) {
      if (activeToast === "cooldown") toast.textContent = `${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(activeToastSeconds)}.`;
      else if (activeToast === "saved") toast.textContent = tr("saved");
      else toast.textContent = tr("saveError");
    }
  };
  window.addEventListener("floxov:languagechange", updateLanguage);
  buttons.forEach((button) => button.addEventListener("click", () => {
    submitVote(Number(button.dataset.reputationVote));
  }));

  const url = typeof config.supabaseUrl === "string" ? config.supabaseUrl.trim().replace(/\/+$/, "") : "";
  const publicKey = typeof config.supabaseAnonKey === "string" ? config.supabaseAnonKey.trim() : "";
  if (!url || !publicKey) {
    buttons.forEach((button) => { button.disabled = true; });
    lastStatus = "unavailable";
    setStatus(tr("unavailable"));
    return;
  }

  const initialize = async () => {
    setStatus(tr("loading"));
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      client = createClient(url, publicKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: "floxov-reputation-session"
        }
      });
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        const { error: signInError } = await client.auth.signInAnonymously();
        if (signInError) throw signInError;
      }
      widget.classList.add("is-connected");
      await refresh();
      buttons.forEach((button) => { button.disabled = false; });
      client.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          // Avoid doing network work inside Supabase's auth callback lock.
          window.setTimeout(() => refresh().catch((error) => {
            console.error("FLOXOV reputation session refresh failed:", error);
          }), 0);
        }
      });
    } catch (error) {
      console.error("FLOXOV reputation initialization failed:", error);
      client = null;
      lastStatus = "connection-error";
      buttons.forEach((button) => { button.disabled = true; });
      setStatus(tr("connectionError"), "error");
    }
  };

  initialize();
})();
