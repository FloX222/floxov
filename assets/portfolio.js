/* FLOXOV / Avatar Portfolio
 * Zero-dependency, spring-driven coverflow. Source data lives in config.js.
 * Uses only transforms/opacity during animation; the original page is untouched.
 */
(() => {
  "use strict";

  const section = document.querySelector("#portfolio");
  const stage = section?.querySelector("[data-portfolio-stage]");
  const cardsRoot = section?.querySelector("[data-portfolio-cards]");
  if (!section || !stage || !cardsRoot) return;

  const entries = Array.isArray(window.FLOXOV_CONFIG?.portfolio)
    ? window.FLOXOV_CONFIG.portfolio.filter(item => item && typeof item.image === "string" && item.image && typeof item.title === "string")
    : [];
  if (!entries.length) {
    cardsRoot.textContent = "Portfolio is currently unavailable.";
    return;
  }

  const $ = selector => document.querySelector(selector);
  const prevButton = $("[data-portfolio-prev]");
  const nextButton = $("[data-portfolio-next]");
  const detailsButton = $("[data-portfolio-details]");
  const dialog = $("[data-portfolio-dialog]");
  const dialogClose = $("[data-portfolio-close]");
  const progress = $("[data-portfolio-progress]");
  const counter = $("[data-portfolio-counter]");
  const title = $("[data-portfolio-title]");
  const dialogTitle = $("[data-portfolio-dialog-title]");
  const dialogDescription = $("[data-portfolio-dialog-description]");
  const dialogImage = $("[data-portfolio-dialog-image]");
  const dialogCounter = $("[data-portfolio-dialog-counter]");
  const N = entries.length;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 740px)");
  const count = value => String(value).padStart(2, "0");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mod = (value, size) => ((value % size) + size) % size;
  const shortest = (value, size) => mod(value + size / 2, size) - size / 2;

  const localizations = {
    en: {
      eyebrow: "VISUAL ARCHIVE", heading: "SELECTED WORK", subtitle: "Digital Avatars & Visual Identity",
      swipeHint: "DRAG TO EXPLORE", selected: "CURRENT SELECTION", details: "VIEW DETAILS",
      footnote: "Concept previews are placeholders until your original avatar projects are added.",
      dialogKicker: "AVATAR / VISUAL STUDY", prev: "Previous avatar", next: "Next avatar",
      close: "Close project details", stage: "Avatar portfolio. Swipe or use left and right arrow keys.",
      project: "Project", of: "of", select: "Select avatar", sample: "Sample concept"
    },
    ru: {
      eyebrow: "ВИЗУАЛЬНЫЙ АРХИВ", heading: "ИЗБРАННЫЕ РАБОТЫ", subtitle: "Аватарки и визуальная айдентика",
      swipeHint: "ЛИСТАЙТЕ В СТОРОНЫ", selected: "ВЫБРАННАЯ РАБОТА", details: "ПОДРОБНЕЕ",
      footnote: "Примеры концептов временные. Замените их собственными готовыми аватарками.",
      dialogKicker: "АВАТАРКА / ВИЗУАЛЬНЫЙ КОНЦЕПТ", prev: "Предыдущая аватарка", next: "Следующая аватарка",
      close: "Закрыть описание работы", stage: "Портфолио аватарок. Листайте или используйте стрелки клавиатуры.",
      project: "Работа", of: "из", select: "Выбрать аватарку", sample: "Пример концепта"
    }
  };
  const lang = () => document.documentElement.dataset.language === "ru" ? "ru" : "en";
  const t = key => localizations[lang()][key];
  const state = {
    active: 0, position: 0, target: 0, velocity: 0,
    frame: 0, lastFrame: 0, spacing: 220, destroyed: false
  };
  const drag = {
    pointerId: null, startX: 0, startY: 0, startPosition: 0,
    active: false, suppressClick: false, lastX: 0, lastTime: 0, velocity: 0
  };

  const cards = entries.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "portfolio-card";
    button.dataset.portfolioIndex = String(index);
    button.setAttribute("aria-roledescription", "slide");
    button.setAttribute("aria-label", `${t("select")}: ${item.title}`);

    const artwork = document.createElement("span");
    artwork.className = "portfolio-artwork";
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = `${item.title} — ${item.placeholder ? t("sample") : "FLOXOV"}`;
    img.width = 720;
    img.height = 720;
    img.loading = index < 3 || index === N - 1 ? "eager" : "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.style.setProperty("--art-position", typeof item.position === "string" ? item.position : "center");
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = "assets/avatars/fallback.webp";
      }
    }, { once: true });
    artwork.append(img);

    const footer = document.createElement("span");
    footer.className = "portfolio-card-footer";
    const name = document.createElement("span");
    name.className = "portfolio-card-name";
    name.textContent = item.title;
    const number = document.createElement("span");
    number.className = "portfolio-card-number";
    number.textContent = count(index + 1);
    footer.append(name, number);
    button.append(artwork, footer);

    button.addEventListener("click", () => {
      if (drag.suppressClick) return;
      if (index === state.active) openDetails();
      else select(index);
    });
    cardsRoot.append(button);
    return button;
  });

  const syncSpacing = () => {
    const width = stage.getBoundingClientRect().width;
    state.spacing = mobileQuery.matches
      ? clamp(width * .34, 97, 135)
      : clamp(width * .215, 135, 230);
    render();
  };

  const render = () => {
    const mobile = mobileQuery.matches;
    cards.forEach((card, index) => {
      const distance = shortest(index - state.position, N);
      const absolute = Math.abs(distance);
      const sign = Math.sign(distance);
      // Continuous center crossing: at distance=0 the displacement MUST be zero.
      // The previous layout jumped immediately to ~0.98 * spacing for any
      // infinitesimal offset, producing a violent left/right twitch on swipe.
      const travel = absolute <= 1
        ? .98 * absolute
        : .98 + (absolute - 1) * .64 - (absolute - 1) ** 2 * .075;
      const x = sign * state.spacing * travel;
      const y = absolute * (mobile ? 7 : 10);
      const z = -absolute * (mobile ? 68 : 92);
      const turn = -sign * Math.min(absolute, 2.1) * (mobile ? 15 : 17);
      const scale = Math.max(.62, 1 - absolute * (mobile ? .105 : .095));
      const fade = absolute < 1 ? 1 : absolute < 2 ? .88 - (absolute - 1) * .21 : absolute < 3 ? .67 - (absolute - 2) * .27 : Math.max(0,.40 - (absolute - 3) * .40);
      card.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      card.style.opacity = String(fade);
      card.style.zIndex = String(100 - Math.round(absolute * 10));
      card.style.setProperty("--card-dim", String(clamp(absolute * (mobile ? .12 : .095), 0, .39)));
      card.style.pointerEvents = absolute > (mobile ? 2.5 : 3.35) ? "none" : "auto";
    });
  };

  const syncActiveUI = () => {
    const item = entries[state.active];
    title.textContent = item.title;
    const spoken = `${t("project")} ${state.active + 1} ${t("of")} ${N}`;
    // DOM construction keeps the counter markup without using an HTML parsing sink.
    const separator = document.createElement("span");
    separator.textContent = "/";
    counter.replaceChildren(document.createTextNode(`${count(state.active + 1)} `), separator, document.createTextNode(` ${count(N)}`));
    counter.setAttribute("aria-label", spoken);
    progress.style.width = `${(state.active + 1) / N * 100}%`;
    cards.forEach((card, index) => {
      const selected = index === state.active;
      card.classList.toggle("is-active", selected);
      card.setAttribute("aria-current", selected ? "true" : "false");
      card.setAttribute("aria-label", `${t("select")}: ${entries[index].title}, ${t("project")} ${index + 1} ${t("of")} ${N}`);
      card.tabIndex = Math.abs(shortest(index - state.active, N)) <= 1 ? 0 : -1;
      const img = card.querySelector("img");
      if (img) img.alt = `${entries[index].title} — ${entries[index].placeholder ? t("sample") : "FLOXOV"}`;
    });
  };

  // Analytic critically damped motion (zeta = 1): no spring overshoot,
  // no oscillation, and no frame-rate-dependent Euler instability.
  // Velocity is measured in carousel-items / second.
  const animate = timestamp => {
    if (state.destroyed || drag.active) { state.frame = 0; state.lastFrame = 0; return; }
    const dt = state.lastFrame
      ? clamp((timestamp - state.lastFrame) / 1000, 1 / 240, .05)
      : 1 / 60;
    state.lastFrame = timestamp;
    const omega = motionQuery.matches ? 1000 : 13;
    const offset = state.position - state.target;
    const coefficient = state.velocity + omega * offset;
    const decay = Math.exp(-omega * dt);
    state.position = state.target + (offset + coefficient * dt) * decay;
    state.velocity = (state.velocity - omega * coefficient * dt) * decay;
    if (Math.abs(state.target - state.position) < .0003 && Math.abs(state.velocity) < .003) {
      // Modulo normalization preserves all card transforms by periodicity.
      state.position = mod(state.target, N);
      state.target = state.position;
      state.velocity = 0;
      state.frame = 0;
      state.lastFrame = 0;
      render();
      return;
    }
    render();
    state.frame = requestAnimationFrame(animate);
  };

  const stopFrame = () => {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.lastFrame = 0;
  };
  const settle = index => {
    stopFrame();
    if (motionQuery.matches) {
      state.position = index;
      state.target = index;
      state.velocity = 0;
      render();
      return;
    }
    state.target = index;
    // Retarget from the current rendered position, not from an old impulse.
    // Reset velocity to prevent direction reversals on rapid repeated taps.
    state.velocity = 0;
    state.frame = requestAnimationFrame(animate);
  };
  const select = index => {
    const nextIndex = mod(index, N);
    if (nextIndex === state.active && !drag.active) {
      settle(state.position + shortest(nextIndex - state.position, N));
      return;
    }
    state.active = nextIndex;
    syncActiveUI();
    // Follow the shortest circular path, even when selecting from either edge.
    settle(state.position + shortest(nextIndex - state.position, N));
  };
  const move = step => select(state.active + step);

  const openDetails = () => {
    if (!dialog || typeof dialog.showModal !== "function") return;
    const item = entries[state.active];
    dialogTitle.textContent = item.title;
    dialogDescription.textContent = item.description?.[lang()] || item.description?.en || "";
    dialogImage.src = item.image;
    dialogImage.alt = `${item.title} — ${item.placeholder ? t("sample") : "FLOXOV"}`;
    dialogCounter.textContent = `${count(state.active + 1)} / ${count(N)}${item.placeholder ? ` · ${t("sample")}` : ""}`;
    if (!dialog.open) dialog.showModal();
  };

  prevButton?.addEventListener("click", () => move(-1));
  nextButton?.addEventListener("click", () => move(1));
  detailsButton?.addEventListener("click", openDetails);
  dialogClose?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  section.addEventListener("keydown", event => {
    if (dialog?.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "Home") { event.preventDefault(); select(0); }
    if (event.key === "End") { event.preventDefault(); select(N - 1); }
  });

  stage.addEventListener("pointerdown", event => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || dialog?.open) return;
    drag.pointerId = event.pointerId;
    drag.startX = drag.lastX = event.clientX;
    drag.startY = event.clientY;
    drag.startPosition = state.position;
    drag.lastTime = event.timeStamp;
    drag.velocity = 0;
    drag.active = false;
    drag.suppressClick = false;
  });
  stage.addEventListener("pointermove", event => {
    if (event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(dy) > Math.abs(dx) * 1.15 || Math.abs(dx) < 7) return;
      drag.active = true;
      stopFrame();
      state.velocity = 0;
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(event.pointerId); } catch (_) { /* Capture can fail when the gesture ends. */ }
    }
    const dt = Math.max(1, event.timeStamp - drag.lastTime);
    drag.velocity = clamp((event.clientX - drag.lastX) / dt, -2.5, 2.5);
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    state.position = drag.startPosition - dx / state.spacing;
    render();
  }, { passive: true });

  const releasePointer = (event, cancelled = false) => {
    if (event.pointerId !== drag.pointerId) return;
    const wasDragging = drag.active;
    const dx = event.clientX - drag.startX;
    drag.pointerId = null;
    drag.active = false;
    stage.classList.remove("is-dragging");
    if (wasDragging) {
      drag.suppressClick = true;
      const projected = cancelled ? state.position
        : state.position - drag.velocity * 65 / state.spacing;
      const origin = Math.round(drag.startPosition);
      let destination = clamp(Math.round(projected), origin - 2, origin + 2);
      if (destination === origin && Math.abs(dx) > 28 && !cancelled)
        destination = origin + (dx < 0 ? 1 : -1);
      const nextIndex = mod(destination, N);
      state.active = nextIndex;
      syncActiveUI();
      settle(state.position + shortest(nextIndex - state.position, N));
      // Suppress the synthetic click from the pointer release, not later taps.
      setTimeout(() => { drag.suppressClick = false; }, 0);
    }
    try { if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId); } catch (_) {}
  };
  stage.addEventListener("pointerup", event => releasePointer(event));
  stage.addEventListener("pointercancel", event => releasePointer(event, true));
  stage.addEventListener("lostpointercapture", () => { stage.classList.remove("is-dragging"); });
  // Respect native page scrolling; intercept only predominantly horizontal trackpad gestures.
  let lastWheelMove = 0;
  stage.addEventListener("wheel", event => {
    if (Math.abs(event.deltaX) < 7 || Math.abs(event.deltaX) < Math.abs(event.deltaY) * 1.3) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelMove < 360) return;
    lastWheelMove = now;
    move(event.deltaX > 0 ? 1 : -1);
  }, { passive: false });

  const translate = () => {
    section.querySelectorAll("[data-portfolio-text]").forEach(element => {
      const key = element.dataset.portfolioText;
      if (key !== "heading") element.textContent = t(key);
    });
    const heading = section.querySelector("[data-portfolio-text='heading']");
    if (heading) heading.replaceChildren(document.createTextNode(t("heading")), Object.assign(document.createElement("span"), { className: "portfolio-heading-period", textContent: "." }));
    stage.setAttribute("aria-label", t("stage"));
    prevButton?.setAttribute("aria-label", t("prev"));
    nextButton?.setAttribute("aria-label", t("next"));
    dialogClose?.setAttribute("aria-label", t("close"));
    if (dialog?.open) openDetails();
    syncActiveUI();
  };
  window.addEventListener("floxov:languagechange", translate);

  // Progressive enhancement: visible content by default; only hide once observer is ready.
  const revealTargets = section.querySelectorAll("[data-portfolio-reveal]");
  let revealObserver = null;
  if ("IntersectionObserver" in window && !motionQuery.matches) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("portfolio-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .07, rootMargin: "0px 0px 32px 0px" });
    section.classList.add("portfolio-motion-ready");
    revealTargets.forEach(target => revealObserver.observe(target));
  } else revealTargets.forEach(target => target.classList.add("portfolio-visible"));

  let resizeObserver = null;
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(syncSpacing);
    resizeObserver.observe(stage);
  } else window.addEventListener("resize", syncSpacing, { passive: true });
  window.addEventListener("pagehide", () => {
    state.destroyed = true;
    stopFrame();
    resizeObserver?.disconnect();
    revealObserver?.disconnect();
  }, { once: true });
  translate();
  syncSpacing();
})();
