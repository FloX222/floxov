/* FLOXOV reputation widget. The existing HTML/CSS interface is preserved. */
import {
  createFloxovSupabaseClient,
  ensureFloxovAnonymousSession
} from "./supabase.js";

(() => {
  "use strict";

  const widget = document.querySelector("[data-reputation-widget]");
  if (!widget) return;

  const buttons = Array.from(widget.querySelectorAll("[data-reputation-vote]"));
  const scoreNode = widget.querySelector("[data-reputation-score]");
  const likesNode = widget.querySelector("[data-reputation-likes]");
  const dislikesNode = widget.querySelector("[data-reputation-dislikes]");
  const statusNode = widget.querySelector("[data-reputation-status]");
  const cooldownNode = widget.querySelector("[data-reputation-cooldown]");
  const toast = document.querySelector("[data-reputation-toast]");

  const messages = {
    en: {
      unavailable: "Voting is unavailable until the Supabase project is configured.",
      loading: "Connecting to reputation service…",
      firstVote: "Cast your first vote. You can change it after 24 hours.",
      saved: "Your vote has been recorded.",
      unchanged: "This vote is already selected. The 24-hour timer was not reset.",
      cooldownTitle: "Vote change unavailable",
      cooldownBody: "You can change your vote again in",
      loadError: "Could not load reputation. Please try again later.",
      saveError: "Your vote could not be saved. Please try again.",
      connectionError: "Could not connect to the voting service.",
      hour: "h",
      minute: "m",
      second: "s"
    },
    ru: {
      unavailable: "Голосование недоступно: проверьте подключение Supabase в assets/config.js.",
      loading: "Подключаем систему репутации…",
      firstVote: "Оставьте первый голос. Изменить его можно будет через 24 часа.",
      saved: "Ваш голос учтён.",
      unchanged: "Этот вариант уже выбран. Таймер 24 часов не был сброшен.",
      cooldownTitle: "Изменение голоса пока недоступно",
      cooldownBody: "Вы сможете изменить голос через",
      loadError: "Не удалось загрузить репутацию. Попробуйте позже.",
      saveError: "Не удалось сохранить голос. Попробуйте ещё раз.",
      connectionError: "Не удалось подключиться к системе голосования.",
      hour: "ч",
      minute: "мин",
      second: "с"
    }
  };

  let language = document.documentElement.dataset.language === "ru" ? "ru" : "en";
  let client = null;
  let busy = false;
  let currentVote = null;
  let cooldownDeadline = 0;
  let countdownTimer = 0;
  let pollTimer = 0;
  let toastTimer = 0;
  let toastHideTimer = 0;
  let activeToastType = "";
  let activeToastSeconds = 0;
  let lastStatusType = "unavailable";
  let operationFailed = false;

  const tr = (key) => messages[language][key] || messages.en[key] || key;
  const unwrap = (data) => Array.isArray(data) ? data[0] : data;

  function setStatus(message, kind = "") {
    if (!statusNode) return;
    statusNode.textContent = message || "";
    if (kind) statusNode.dataset.kind = kind;
    else delete statusNode.dataset.kind;
  }

  function formatDuration(totalSeconds) {
    const safe = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    if (hours > 0) return `${hours}${tr("hour")} ${String(minutes).padStart(2, "0")}${tr("minute")}`;
    if (minutes > 0) return `${minutes}${tr("minute")} ${String(seconds).padStart(2, "0")}${tr("second")}`;
    return `${seconds}${tr("second")}`;
  }

  function setVoteState(vote) {
    buttons.forEach((button) => {
      const selected = vote !== null && vote !== undefined
        && Number(button.dataset.reputationVote) === Number(vote);
      button.dataset.selected = String(Boolean(selected));
      button.setAttribute("aria-pressed", String(Boolean(selected)));
    });
  }

  function renderCountdown() {
    if (!cooldownNode) return;
    const remaining = Math.max(0, Math.ceil((cooldownDeadline - Date.now()) / 1000));
    if (remaining <= 0) {
      window.clearInterval(countdownTimer);
      countdownTimer = 0;
      cooldownDeadline = 0;
      cooldownNode.hidden = true;
      cooldownNode.textContent = "";
      if (lastStatusType === "cooldown" || lastStatusType === "cooldown-active") {
        lastStatusType = "saved";
        setStatus(tr("saved"), "success");
      }
      return;
    }

    cooldownNode.hidden = false;
    cooldownNode.textContent = `${tr("cooldownBody")} ${formatDuration(remaining)}.`;
    if (lastStatusType === "cooldown") {
      setStatus(`${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(remaining)}.`, "error");
    }
    if (activeToastType === "cooldown" && toast && !toast.hidden) {
      activeToastSeconds = remaining;
      toast.textContent = toastMessage();
    }
  }

  function setCooldown(seconds) {
    window.clearInterval(countdownTimer);
    countdownTimer = 0;
    const safeSeconds = Math.max(0, Math.ceil(Number(seconds) || 0));
    cooldownDeadline = safeSeconds > 0 ? Date.now() + safeSeconds * 1000 : 0;
    if (!cooldownNode) return;
    if (safeSeconds <= 0) {
      cooldownNode.hidden = true;
      cooldownNode.textContent = "";
      return;
    }
    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 1000);
  }

  function setStats(data) {
    if (!data) return;
    const likes = Number(data.likes) || 0;
    const dislikes = Number(data.dislikes) || 0;
    const reputation = Number(data.reputation) || 0;

    if (likesNode) likesNode.textContent = String(likes);
    if (dislikesNode) dislikesNode.textContent = String(dislikes);
    if (scoreNode) {
      scoreNode.textContent = reputation > 0 ? `+${reputation}` : String(reputation);
      scoreNode.classList.remove("is-updated");
      window.requestAnimationFrame(() => scoreNode.classList.add("is-updated"));
    }

    currentVote = data.my_vote === null || data.my_vote === undefined
      ? null
      : Number(data.my_vote);
    setVoteState(currentVote);
    setCooldown(data.seconds_remaining);
  }

  function toastMessage() {
    if (activeToastType === "cooldown") {
      return `${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(activeToastSeconds)}.`;
    }
    if (activeToastType === "error") return tr("saveError");
    if (activeToastType === "connection") return tr("connectionError");
    if (activeToastType === "unchanged") return tr("unchanged");
    return activeToastType === "saved" ? tr("saved") : "";
  }

  function showToast(type, seconds = 0) {
    if (!toast) return;
    activeToastType = type;
    activeToastSeconds = Math.max(0, Number(seconds) || 0);
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastHideTimer);
    toast.textContent = toastMessage();
    toast.hidden = false;
    window.requestAnimationFrame(() => toast.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toastHideTimer = window.setTimeout(() => {
        toast.hidden = true;
        activeToastType = "";
      }, 240);
    }, 4200);
  }

  function setBusy(value) {
    busy = value;
    buttons.forEach((button) => { button.disabled = value || !client; });
    widget.classList.toggle("is-loading", value);
  }

  async function refresh({ updateMessage = true } = {}) {
    if (!client) return;
    const { data, error } = await client.rpc("get_floxov_reputation");
    if (error) throw error;
    const row = unwrap(data);
    if (!row) throw new Error("get_floxov_reputation returned no row.");

    setStats(row);
    if (!updateMessage) return row;

    if (currentVote === 1 || currentVote === -1) {
      if (Number(row.seconds_remaining) > 0) {
        lastStatusType = "cooldown-active";
        setStatus("");
      } else {
        lastStatusType = "saved";
        setStatus(tr("saved"), "success");
      }
    } else {
      lastStatusType = "firstVote";
      setStatus(tr("firstVote"));
    }
    return row;
  }

  async function submitVote(vote) {
    if (!client || busy || (vote !== 1 && vote !== -1)) return;
    setBusy(true);
    try {
      const { data, error } = await client.rpc("vote_floxov", { p_vote: vote });
      if (error) throw error;
      const row = unwrap(data);
      if (!row) throw new Error("vote_floxov returned no row.");

      setStats(row);
      operationFailed = false;

      if (row.status === "cooldown") {
        lastStatusType = "cooldown";
        const seconds = Number(row.seconds_remaining) || 0;
        setStatus(`${tr("cooldownTitle")}. ${tr("cooldownBody")} ${formatDuration(seconds)}.`, "error");
        showToast("cooldown", seconds);
      } else if (row.status === "unchanged") {
        lastStatusType = Number(row.seconds_remaining) > 0 ? "cooldown-active" : "saved";
        setStatus(tr("unchanged"), "success");
        showToast("unchanged");
      } else if (row.status === "accepted") {
        lastStatusType = "saved";
        setStatus(tr("saved"), "success");
        showToast("saved");
      } else {
        throw new Error(`Unexpected vote status: ${String(row.status)}`);
      }
    } catch (error) {
      console.error("FLOXOV reputation vote failed:", error);
      operationFailed = true;
      lastStatusType = "error";
      setStatus(tr("saveError"), "error");
      showToast("error");
      try { await refresh({ updateMessage: false }); } catch (refreshError) {
        console.warn("FLOXOV reputation refresh after vote error failed:", refreshError);
      }
    } finally {
      setBusy(false);
    }
  }

  function updateLanguage() {
    language = document.documentElement.dataset.language === "ru" ? "ru" : "en";
    if (!client) {
      setStatus(tr("unavailable"));
      return;
    }
    if (cooldownDeadline > Date.now()) {
      renderCountdown();
    } else if (operationFailed) {
      setStatus(tr("saveError"), "error");
    } else if (lastStatusType === "firstVote" || currentVote === null) {
      setStatus(tr("firstVote"));
    } else if (lastStatusType === "cooldown-active") {
      setStatus("");
    } else if (lastStatusType === "saved") {
      setStatus(tr("saved"), "success");
    }
    if (toast && !toast.hidden && activeToastType) toast.textContent = toastMessage();
  }

  async function initialize() {
    setBusy(true);
    setStatus(tr("loading"));
    try {
      client = await createFloxovSupabaseClient();
      await ensureFloxovAnonymousSession(client);
      widget.classList.add("is-connected");
      await refresh();
      setBusy(false);

      // A quiet refresh keeps global totals reasonably current across open browser sessions.
      pollTimer = window.setInterval(async () => {
        if (!client || busy || document.visibilityState !== "visible") return;
        try { await refresh({ updateMessage: false }); }
        catch (error) { console.warn("FLOXOV reputation background refresh failed:", error); }
      }, 60000);
    } catch (error) {
      console.error("FLOXOV reputation initialization failed:", error);
      client = null;
      setBusy(false);
      buttons.forEach((button) => { button.disabled = true; });
      if (error?.code === "FLOXOV_SUPABASE_CONFIG_MISSING") {
        lastStatusType = "unavailable";
        setStatus(tr("unavailable"));
      } else {
        lastStatusType = "connection";
        setStatus(tr("connectionError"), "error");
      }
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      submitVote(Number(button.dataset.reputationVote));
    });
  });

  window.addEventListener("floxov:languagechange", updateLanguage);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && client && !busy) {
      refresh({ updateMessage: false }).catch((error) => {
        console.warn("FLOXOV reputation visibility refresh failed:", error);
      });
    }
  });

  initialize();
})();
