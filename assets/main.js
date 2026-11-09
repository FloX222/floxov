(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const config = window.FLOXOV_CONFIG || {};
  const validLanguages = ["en", "ru"];

  const translations = {
    en: {
      skip: "Skip to content",
      navLabel: "Main navigation",
      mobileNavLabel: "Mobile navigation",
      languageLabel: "Choose language",
      brandHome: "FLOXOV home",
      navHome: "Home",
      navProjects: "Projects",
      navContact: "Contact",
      menuOpen: "Open navigation menu",
      menuClose: "Close navigation menu",
      documentTitle: "FLOXOV — Personal Website",
      metaDescription: "A personal space by FLOXOV for technology, design, and digital work.",
      ogTitle: "FLOXOV — Personal Website",
      ogDescription: "A personal space for technology, design, and digital work.",
      heroStatement: "Digital work, made with intent.",
      heroRoleLineOne: "Web Designer",
      heroRoleLineTwo: "Graphic Designer",
      heroContact: "Get in touch",
      heroDescription: "I bring technology and creative thinking together to shape clear, distinctive digital experiences.",
      repTitle: "FLOXOV REPUTATION",
      repScoreLabel: "Current reputation score",
      repVoteGroupLabel: "Vote on FLOXOV reputation",
      avatarGlitchLabel: "FLOXOV avatar. Focus or hover to trigger a brief glitch effect.",
      repLike: "Like",
      repDislike: "Dislike",
      repLikes: "likes",
      repDislikes: "dislikes",
      repLikeLabel: "Increase FLOXOV reputation",
      repDislikeLabel: "Decrease FLOXOV reputation",
      repUnavailable: "Voting is unavailable until the backend is configured.",
      artIndexOne: "CONCEPT / 001",
      artIndexTwo: "EXPERIMENT / 002",
      artIndexThree: "SYSTEM / 003",
      artIndexFour: "RESEARCH / 004",
      artDigital: "FLOXOV / DIGITAL",
      artMotionWord: "MOTION\nLAB",
      artInterfaceWord: "INTERFACE\nSYSTEM",
      artToolsWord: "CREATIVE\nTOOLS",
      heroVisualLabel: "FLOXOV hero visual",
      scrollContact: "Scroll to contact",
      focusKicker: "Areas of focus",
      focusTitleA: "The work is",
      focusTitleB: "in the details.",
      focusAside: "A flexible mix of visual thinking and technical implementation.",
      focusOneTitle: "Web development",
      focusOneText: "Responsive interfaces and thoughtful implementation.",
      focusTwoTitle: "UI / UX design",
      focusTwoText: "Clear structure, usable flows, and visual consistency.",
      focusThreeTitle: "Creative coding",
      focusThreeText: "Experiments connecting code and visual expression.",
      focusFourTitle: "Motion design",
      focusFourText: "Purposeful movement and refined interaction details.",
      focusFiveTitle: "Digital experiences",
      focusFiveText: "Cohesive experiences across screens and devices.",
      focusSixTitle: "Technology",
      focusSixText: "Exploration of tools, workflows, and new possibilities.",
      toolsKicker: "Tools & methods",
      toolsTitle: "A working toolkit.",
      toolsAside: "A practical mix of tools and methods across the visual and technical sides of digital work.",
      toolGroupWeb: "Web development",
      toolGroupDesign: "Design & experience",
      toolGroupMotion: "Motion & interaction",
      toolGroupCreative: "Creative technology",
      toolTagDesignSystems: "Design systems",
      toolTagPrototyping: "Prototyping",
      toolTagCssMotion: "CSS motion",
      toolTagMicro: "Micro-interactions",
      toolTagCreative: "Creative coding",
      toolTagAi: "AI workflows",
      toolTagExperimentation: "Experimentation",
      projectsKicker: "Selected work",
      projectsTitleA: "Ideas in",
      projectsTitleB: "different forms.",
      projectsAside: "A selection of concepts and explorations across design, code, and creative technology.",
      previewPlaceholder: "Concept preview",
      conceptStudy: "Concept study · no public link",
      projectVisualLabel: "Concept visual, not a project screenshot",
      projectOneTitle: "Digital identity concept",
      projectOneCategory: "Design / Web",
      projectOneDescription: "A visual direction study for a modern personal brand and its digital presence.",
      projectTwoTitle: "Motion experiments",
      projectTwoCategory: "Code / Motion",
      projectTwoDescription: "An exploration of transitions, interaction timing, and expressive interface movement.",
      projectThreeTitle: "Interface system",
      projectThreeCategory: "Product / UI",
      projectThreeDescription: "A modular interface concept focused on hierarchy, consistency, and responsive behavior.",
      projectFourTitle: "Creative tools study",
      projectFourCategory: "Technology / Concept",
      projectFourDescription: "A concept space for testing new workflows and creative technology ideas.",
      projectsFootnote: "These are concept placeholders carried over from the original project, not verified client case studies or published product screenshots. Replace them with real work before launch.",
      contactTitle: "For collaboration inquiries",
      contactDescription: "Open to thoughtful projects and collaboration.",
      copySuccess: "Username copied",
      copyFailure: "Could not copy username",
      copyButtonLabel: "Copy {platform} username",
      copyButtonTitle: "Copy username to clipboard",
      contactUnavailable: "Contact details have not been configured yet.",
      contactEmailAction: "Send an email",
      footerCopyright: "© 2021 FLOXOV",
      backTop: "Back to top",
      projectOpen: "Open project",
      projectNoLink: "No public project link provided",
      emailLabel: "Email FLOXOV",
      projectTagArt: "Art direction",
      projectTagUi: "UI design",
      projectTagWeb: "Web",
      projectTagCreative: "Creative coding",
      projectTagAnimation: "Animation",
      projectTagPrototype: "Prototype",
      projectTagSystem: "Design system",
      projectTagResponsive: "Responsive",
      projectTagUx: "UX",
      projectTagExperiment: "Experiment",
      projectTagTechnology: "Technology",
      projectTagConcept: "Concept"
    },
    ru: {
      skip: "Перейти к содержимому",
      navLabel: "Основная навигация",
      mobileNavLabel: "Мобильная навигация",
      languageLabel: "Выбрать язык",
      brandHome: "FLOXOV, на главную",
      navHome: "Главная",
      navProjects: "Проекты",
      navContact: "Контакты",
      menuOpen: "Открыть меню навигации",
      menuClose: "Закрыть меню навигации",
      documentTitle: "FLOXOV — личный сайт",
      metaDescription: "Личный сайт FLOXOV о технологиях, дизайне и цифровых проектах.",
      ogTitle: "FLOXOV — личный сайт",
      ogDescription: "Личное пространство FLOXOV о технологиях, дизайне и цифровой работе.",
      heroStatement: "Цифровые проекты с продуманным подходом.",
      heroRoleLineOne: "Веб-дизайнер",
      heroRoleLineTwo: "Графический дизайнер",
      heroContact: "Связаться",
      heroDescription: "Объединяю технологии и творческое мышление, чтобы создавать понятные и выразительные цифровые решения.",
      repTitle: "РЕПУТАЦИЯ FLOXOV",
      repScoreLabel: "Текущий показатель репутации",
      repVoteGroupLabel: "Оценить репутацию FLOXOV",
      avatarGlitchLabel: "Аватар FLOXOV. Наведите курсор или установите фокус, чтобы запустить эффект глитча.",
      repLike: "Нравится",
      repDislike: "Не нравится",
      repLikes: "лайков",
      repDislikes: "дизлайков",
      repLikeLabel: "Увеличить репутацию FLOXOV",
      repDislikeLabel: "Уменьшить репутацию FLOXOV",
      repUnavailable: "Голосование станет доступно после настройки сервера.",
      artIndexOne: "КОНЦЕПТ / 001",
      artIndexTwo: "ЭКСПЕРИМЕНТ / 002",
      artIndexThree: "СИСТЕМА / 003",
      artIndexFour: "ИССЛЕДОВАНИЕ / 004",
      artDigital: "FLOXOV / ЦИФРОВОЙ БРЕНД",
      artMotionWord: "МОУШН\nЛАБ",
      artInterfaceWord: "ИНТЕРФЕЙСНАЯ\nСИСТЕМА",
      artToolsWord: "ТВОРЧЕСКИЕ\nИНСТРУМЕНТЫ",
      heroVisualLabel: "Визуальная обложка FLOXOV",
      scrollContact: "К контактам",
      focusKicker: "Направления",
      focusTitleA: "Качество",
      focusTitleB: "скрывается в деталях.",
      focusAside: "Сочетание визуального мышления и технической реализации.",
      focusOneTitle: "Веб-разработка",
      focusOneText: "Адаптивные интерфейсы и аккуратная техническая реализация.",
      focusTwoTitle: "UI / UX-дизайн",
      focusTwoText: "Понятная структура, удобные сценарии и визуальная целостность.",
      focusThreeTitle: "Креативное программирование",
      focusThreeText: "Эксперименты на пересечении кода и визуального выражения.",
      focusFourTitle: "Моушн-дизайн",
      focusFourText: "Осмысленная анимация и точные детали взаимодействия.",
      focusFiveTitle: "Цифровые продукты",
      focusFiveText: "Цельный пользовательский опыт на разных экранах и устройствах.",
      focusSixTitle: "Технологии",
      focusSixText: "Изучение инструментов, рабочих процессов и новых возможностей.",
      toolsKicker: "Инструменты и методы",
      toolsTitle: "Рабочий инструментарий.",
      toolsAside: "Инструменты и подходы, которые объединяют визуальную и техническую стороны цифровой работы.",
      toolGroupWeb: "Веб-разработка",
      toolGroupDesign: "Дизайн и пользовательский опыт",
      toolGroupMotion: "Анимация и взаимодействие",
      toolGroupCreative: "Творческие технологии",
      toolTagDesignSystems: "Дизайн-системы",
      toolTagPrototyping: "Прототипирование",
      toolTagCssMotion: "CSS-анимация",
      toolTagMicro: "Микровзаимодействия",
      toolTagCreative: "Креативное программирование",
      toolTagAi: "ИИ-процессы",
      toolTagExperimentation: "Эксперименты",
      projectsKicker: "Избранные работы",
      projectsTitleA: "Идеи в",
      projectsTitleB: "разных формах.",
      projectsAside: "Подборка концепций и экспериментов в области дизайна, программирования и творческих технологий.",
      previewPlaceholder: "Концептуальный макет",
      conceptStudy: "Концепция · публичной ссылки нет",
      projectVisualLabel: "Концептуальная графика, не скриншот проекта",
      projectOneTitle: "Концепция цифровой идентичности",
      projectOneCategory: "Дизайн / Веб",
      projectOneDescription: "Исследование визуального направления для современного личного бренда и его цифрового образа.",
      projectTwoTitle: "Эксперименты с анимацией",
      projectTwoCategory: "Код / Анимация",
      projectTwoDescription: "Исследование переходов, ритма взаимодействия и выразительной анимации интерфейсов.",
      projectThreeTitle: "Система интерфейсов",
      projectThreeCategory: "Продукт / UI",
      projectThreeDescription: "Концепция модульного интерфейса с акцентом на иерархию, согласованность и адаптивность.",
      projectFourTitle: "Исследование творческих инструментов",
      projectFourCategory: "Технологии / Концепция",
      projectFourDescription: "Концептуальная площадка для проверки новых рабочих процессов и идей на стыке технологий и творчества.",
      projectsFootnote: "Это концептуальные заглушки, перенесённые из исходного проекта, а не подтверждённые кейсы клиентов или скриншоты опубликованных продуктов. Перед публикацией замените их реальными работами.",
      contactTitle: "По поводу сотрудничества",
      contactDescription: "Открыт к интересным проектам и предложениям о сотрудничестве.",
      copySuccess: "Юзернейм скопирован",
      copyFailure: "Не удалось скопировать юзернейм",
      copyButtonLabel: "Скопировать юзернейм {platform}",
      copyButtonTitle: "Скопировать юзернейм в буфер обмена",
      contactUnavailable: "Контактные данные пока не настроены.",
      contactEmailAction: "Написать на почту",
      footerCopyright: "© 2021 FLOXOV",
      backTop: "Наверх",
      projectOpen: "Открыть проект",
      projectNoLink: "Публичная ссылка на проект не указана",
      emailLabel: "Написать FLOXOV",
      projectTagArt: "Арт-дирекшн",
      projectTagUi: "UI-дизайн",
      projectTagWeb: "Веб",
      projectTagCreative: "Креативное программирование",
      projectTagAnimation: "Анимация",
      projectTagPrototype: "Прототип",
      projectTagSystem: "Дизайн-система",
      projectTagResponsive: "Адаптивность",
      projectTagUx: "UX",
      projectTagExperiment: "Эксперимент",
      projectTagTechnology: "Технологии",
      projectTagConcept: "Концепция"
    }
  };

  const safeRead = (key) => {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  };
  const safeWrite = (key, value) => {
    try { window.localStorage.setItem(key, value); } catch (_) { /* Storage can be unavailable. */ }
  };
  const detectLanguage = () => {
    const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return browserLanguage.toLowerCase().startsWith("ru") ? "ru" : "en";
  };
  const t = (key) => {
    const language = validLanguages.includes(root.lang) ? root.lang : "en";
    const value = translations[language][key] || translations.en[key] || key;
    const configuredName = config.profile && typeof config.profile.name === "string" && config.profile.name.trim()
      ? config.profile.name.trim()
      : "FLOXOV";
    return String(value).split("FLOXOV").join(configuredName);
  };

  let currentLanguage = validLanguages.includes(root.lang) ? root.lang : (safeRead("floxov-language") || detectLanguage());
  root.dataset.theme = "dark";

  const updateMeta = () => {
    document.title = t("documentTitle");
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (description) description.setAttribute("content", t("metaDescription"));
    if (ogTitle) ogTitle.setAttribute("content", t("ogTitle"));
    if (ogDescription) ogDescription.setAttribute("content", t("ogDescription"));
    if (twitterTitle) twitterTitle.setAttribute("content", t("ogTitle"));
    if (twitterDescription) twitterDescription.setAttribute("content", t("ogDescription"));
    if (themeColor) themeColor.setAttribute("content", "#080808");
  };

  const updateLanguageControls = () => {
    document.querySelectorAll(".language-option[data-language]").forEach((button) => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const translateStaticContent = () => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      element.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", t(element.dataset.i18nTitle));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });
  };

  const localizedValue = (value, language) => {
    if (value && typeof value === "object") return value[language] || value.en || "";
    return typeof value === "string" ? value : "";
  };

  const setupProfileImage = () => {
    const profile = config.profile || {};
    const media = config.heroMedia || {};
    const image = document.querySelector("[data-profile-image]");
    const video = document.querySelector("[data-profile-video]");
    const frame = document.querySelector("[data-profile-frame]");
    const glitchLayers = frame ? Array.from(frame.querySelectorAll("[data-profile-glitch-layer]")) : [];
    if (!image || !frame) return;

    const cleanPath = (value) => typeof value === "string" ? value.trim() : "";
    const source = cleanPath(media.source) || cleanPath(profile.image);
    const poster = cleanPath(media.poster) || cleanPath(profile.image);
    const position = cleanPath(media.position) || cleanPath(profile.imagePosition) || "50% 50%";
    const fit = media.fit === "contain" || profile.imageFit === "contain" ? "contain" : "cover";
    const aspectCandidate = cleanPath(media.aspectRatio) || cleanPath(profile.aspectRatio);
    const aspectRatio = aspectCandidate && /^[0-9.]+\s*\/\s*[0-9.]+$/.test(aspectCandidate)
      ? aspectCandidate
      : "1 / 1";
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection && connection.saveData);
    const isVideo = /\.(mp4|webm|ogv)(?:[?#].*)?$/i.test(source);
    const glitchSource = isVideo ? (poster || cleanPath(profile.image)) : source;

    frame.style.aspectRatio = aspectRatio;
    glitchLayers.forEach((layer) => {
      layer.style.objectPosition = position;
      layer.style.objectFit = fit;
      if (glitchSource) layer.src = glitchSource;
    });
    image.alt = t("heroVisualLabel");
    image.style.objectPosition = position;
    image.style.objectFit = fit;
    frame.classList.remove("is-media-missing");

    const markMissing = () => {
      frame.classList.add("is-media-missing");
      image.hidden = true;
      if (video && !video.getAttribute("src")) {
        video.hidden = true;
        video.classList.remove("is-loaded");
      }
    };

    const loadImage = (path, fallbackPath = "") => {
      if (!path) {
        if (fallbackPath && fallbackPath !== path) return loadImage(fallbackPath);
        markMissing();
        return;
      }

      image.hidden = false;
      image.classList.remove("is-loaded");
      image.addEventListener("load", () => {
        image.classList.add("is-loaded");
        frame.classList.remove("is-media-missing");
      }, { once: true });
      image.addEventListener("error", () => {
        image.classList.remove("is-loaded");
        image.hidden = true;
        if (fallbackPath && fallbackPath !== path) loadImage(fallbackPath);
        else if (!video || video.hidden || !video.classList.contains("is-loaded")) markMissing();
      }, { once: true });
      image.src = path;
      if (image.complete && image.naturalWidth > 0) {
        image.classList.add("is-loaded");
        frame.classList.remove("is-media-missing");
      }
    };

    if (!source) {
      markMissing();
      return;
    }

    if (!isVideo || !video) {
      if (video) video.hidden = true;
      loadImage(source, cleanPath(profile.image));
      return;
    }

    // Keep a still image visible underneath the video while it loads or when autoplay is blocked.
    loadImage(poster, cleanPath(profile.image));
    video.hidden = true;
    video.classList.remove("is-loaded");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.poster = poster || "";
    video.preload = (reducedMotion || saveData) ? "none" : "metadata";

    if (reducedMotion || saveData) return;

    video.addEventListener("loadeddata", () => {
      video.hidden = false;
      video.classList.add("is-loaded");
      image.classList.remove("is-loaded");
      image.hidden = true;
      frame.classList.remove("is-media-missing");
      const playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          // A decoded still frame remains visible when the browser blocks autoplay.
          video.dataset.autoplayBlocked = "true";
        });
      }
    }, { once: true });

    video.addEventListener("error", () => {
      video.hidden = true;
      video.classList.remove("is-loaded");
      if (image.complete && image.naturalWidth > 0) {
        image.hidden = false;
        image.classList.add("is-loaded");
        frame.classList.remove("is-media-missing");
      } else {
        markMissing();
      }
    }, { once: true });

    video.src = source;
    video.load();
  };

  const setupAvatarGlitch = () => {
    const frame = document.querySelector("[data-profile-frame]");
    if (!frame) return;
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let resetTimer = 0;
    const clearGlitch = () => {
      window.clearTimeout(resetTimer);
      frame.classList.remove("is-glitching");
    };
    const playGlitch = () => {
      window.clearTimeout(resetTimer);
      frame.classList.remove("is-glitching");
      // Restart the one-shot animation on every new hover/focus/touch interaction.
      void frame.offsetWidth;
      frame.classList.add("is-glitching");
      resetTimer = window.setTimeout(clearGlitch, 760);
    };

    frame.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") playGlitch();
    });
    frame.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") clearGlitch();
    });
    frame.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") playGlitch();
    }, { passive: true });
    frame.addEventListener("focus", playGlitch);
    frame.addEventListener("blur", clearGlitch);
  };

  const setupBrandLogo = () => {
    const brand = config.brand || {};
    const mark = document.querySelector("[data-brand-mark]");
    const logo = document.querySelector("[data-brand-logo]");
    const name = document.querySelector("[data-brand-name]");
    if (!mark || !logo) return;

    const source = typeof brand.logoImage === "string" ? brand.logoImage.trim() : "";
    if (!source) {
      mark.hidden = true;
      if (name) name.hidden = false;
      return;
    }

    const logoSize = Number(brand.logoSize);
    if (Number.isFinite(logoSize) && logoSize >= 20 && logoSize <= 72) {
      mark.style.setProperty("--brand-logo-size", `${logoSize}px`);
    }

    mark.hidden = false;
    logo.hidden = true;
    logo.addEventListener("load", () => {
      logo.hidden = false;
      mark.classList.add("has-custom-logo");
      if (name) name.hidden = brand.showName === false;
    }, { once: true });
    logo.addEventListener("error", () => {
      logo.hidden = true;
      mark.hidden = true;
      mark.classList.remove("has-custom-logo");
      if (name) name.hidden = false;
    }, { once: true });
    logo.alt = "";
    logo.src = source;
    if (logo.complete && logo.naturalWidth > 0) {
      logo.hidden = false;
      mark.classList.add("has-custom-logo");
      if (name) name.hidden = brand.showName === false;
    }
  };

  const setupContactBackgroundVideo = () => {
    const contact = config.contact || {};
    const video = document.querySelector("[data-contact-background-video]");
    const posterLayer = document.querySelector("[data-contact-video-poster]");
    const overlay = document.querySelector("[data-contact-video-overlay]");
    const panel = document.querySelector(".contact-panel");
    if (!video || !panel) return;

    const source = typeof contact.backgroundVideo === "string" ? contact.backgroundVideo.trim() : "";
    const poster = typeof contact.backgroundPoster === "string" ? contact.backgroundPoster.trim() : "";
    if (!source && !poster) return;

    const clampOpacity = (value, fallback) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
    };
    panel.style.setProperty("--contact-video-overlay-dark", clampOpacity(contact.videoOverlayDark, 0.66));

    if (poster && posterLayer) {
      posterLayer.style.backgroundImage = `url("${poster.replace(/["\\]/g, "\\$&")}")`;
      posterLayer.hidden = false;
      video.poster = poster;
    }
    if (overlay) overlay.hidden = false;
    if (!source) return;

    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection && connection.saveData);
    if (saveData) return; // Keep the poster or graphite gradient on data-saving connections.

    video.hidden = false;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = !reducedMotion;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    if (!reducedMotion) video.setAttribute("autoplay", "");
    else video.removeAttribute("autoplay");
    video.src = source;

    const tryPlay = () => {
      if (reducedMotion) {
        video.pause(); // Keep the first decoded frame as a still fallback.
        return;
      }
      const playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          // Keep the decoded frame visible; autoplay rejection must not erase the background.
          video.dataset.autoplayBlocked = "true";
        });
      }
    };

    video.addEventListener("error", () => {
      video.hidden = true;
      video.dataset.loadFailed = "true";
    }, { once: true });
    video.addEventListener("loadeddata", () => {
      video.dataset.ready = "true";
      if (reducedMotion) video.pause();
    }, { once: true });
    video.addEventListener("canplay", tryPlay, { once: true });
    video.load();
    if (video.readyState >= 3) tryPlay();
  };

  const validExternalUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.href);
      return (url.protocol === "https:" || url.protocol === "http:") ? url.href : "";
    } catch (_) { return ""; }
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const buildProjectArtwork = (visual, language) => {
    const art = createElement("div", `project-art art-${visual}`);
    art.setAttribute("aria-label", t("projectVisualLabel"));
    art.setAttribute("role", "img");
    art.append(createElement("span", "art-index", ({
      identity: t("artIndexOne"),
      motion: t("artIndexTwo"),
      interface: t("artIndexThree"),
      tools: t("artIndexFour")
    })[visual] || "CONCEPT"));

    if (visual === "identity") {
      art.append(createElement("span", "art-orbit"));
      const monogram = createElement("span", "art-monogram");
      monogram.append(document.createTextNode("F"));
      monogram.append(createElement("span", "", "."));
      art.append(monogram);
      art.append(createElement("span", "art-caption", t("artDigital")));
    } else if (visual === "motion") {
      const rings = createElement("span", "motion-rings");
      rings.append(createElement("i"), createElement("i"), createElement("i"));
      art.append(rings);
      art.append(createElement("span", "motion-word", t("artMotionWord")));
    } else if (visual === "interface") {
      const windowArt = createElement("span", "interface-window");
      windowArt.append(createElement("i"), createElement("i"), createElement("i"));
      for (let i = 0; i < 4; i += 1) windowArt.append(createElement("b"));
      art.append(windowArt);
      art.append(createElement("span", "interface-word", t("artInterfaceWord")));
    } else {
      const shapes = createElement("span", "tool-shapes");
      shapes.append(createElement("i"), createElement("i"), createElement("i"));
      art.append(shapes);
      art.append(createElement("span", "tools-word", t("artToolsWord")));
    }

    art.append(createElement("span", "preview-note", t("previewPlaceholder")));
    return art;
  };

  const renderProjects = () => {
    const grid = document.getElementById("project-grid");
    const projects = Array.isArray(config.projects) ? config.projects : [];
    if (!grid || !projects.length) return;

    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
      if (!project || typeof project !== "object") return;
      const card = createElement("article", "project-card");

      const visual = ["identity", "motion", "interface", "tools"].includes(project.visual) ? project.visual : "identity";
      card.append(buildProjectArtwork(visual, currentLanguage));

      const heading = createElement("div", "project-card-heading");
      heading.append(createElement("h3", "", localizedValue(project.title, currentLanguage)));
      heading.append(createElement("span", "", localizedValue(project.category, currentLanguage)));
      card.append(heading);

      card.append(createElement("p", "", localizedValue(project.description, currentLanguage)));

      const tags = createElement("div", "project-tags");
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag) => {
          const label = localizedValue(tag, currentLanguage);
          if (label) tags.append(createElement("span", "", label));
        });
      }
      if (tags.childElementCount) card.append(tags);

      const footer = createElement("div", "project-card-foot");
      const url = validExternalUrl(project.url);
      if (url) {
        const link = createElement("a", "project-card-link", t("projectOpen"));
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(createElement("span", "", "↗"));
        footer.append(link);
      } else {
        footer.append(createElement("span", "", t("conceptStudy")));
        footer.append(createElement("span", "project-status-dot", "•"));
      }
      card.append(footer);
      fragment.append(card);
    });

    if (fragment.childElementCount) {
      grid.replaceChildren(fragment);
    }
  };

  const renderToolGroups = () => {
    const container = document.getElementById("tool-groups");
    const groups = Array.isArray(config.toolGroups) ? config.toolGroups : [];
    if (!container || !groups.length) return;

    const fragment = document.createDocumentFragment();
    groups.forEach((group) => {
      if (!group || typeof group !== "object") return;
      const article = createElement("article", "tool-group");
      article.append(createElement("h4", "", localizedValue(group.title, currentLanguage)));
      const tags = createElement("div", "project-tags");
      if (Array.isArray(group.tags)) {
        group.tags.forEach((tag) => {
          const label = localizedValue(tag, currentLanguage);
          if (label) tags.append(createElement("span", "", label));
        });
      }
      article.append(tags);
      fragment.append(article);
    });
    if (fragment.childElementCount) container.replaceChildren(fragment);
  };

  let copyInProgress = false;
  let lastCopyAttemptAt = 0;
  let copyToastTimer = 0;
  let copyToastHideTimer = 0;
  let copyToastStatus = "";

  const updateCopyToastContent = () => {
    const toast = document.querySelector("[data-copy-toast]");
    if (!toast || !copyToastStatus) return;

    const success = copyToastStatus === "success";
    const message = toast.querySelector("[data-copy-toast-message]");
    const iconPath = toast.querySelector(".copy-toast-icon svg path");

    if (message) message.textContent = t(success ? "copySuccess" : "copyFailure");
    toast.dataset.status = copyToastStatus;
    toast.setAttribute("role", success ? "status" : "alert");
    toast.setAttribute("aria-live", success ? "polite" : "assertive");

    if (iconPath) {
      iconPath.setAttribute(
        "d",
        success
          ? "m5 12.5 4.2 4.2L19 7"
          : "M12 8v4m0 4h.01M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Z"
      );
    }
  };

  const showCopyToast = (status) => {
    const toast = document.querySelector("[data-copy-toast]");
    if (!toast) return;

    window.clearTimeout(copyToastTimer);
    window.clearTimeout(copyToastHideTimer);
    copyToastStatus = status;
    updateCopyToastContent();

    toast.hidden = false;
    toast.classList.remove("is-visible");
    window.requestAnimationFrame(() => toast.classList.add("is-visible"));

    copyToastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      copyToastHideTimer = window.setTimeout(() => {
        toast.hidden = true;
        copyToastStatus = "";
      }, 240);
    }, 2000);
  };

  const copyTextToClipboard = async (value) => {
    const text = String(value);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Clipboard permissions can be denied even when the API exists; try the legacy fallback.
      }
    }

    if (typeof document.execCommand !== "function") return false;

    const activeElement = document.activeElement;
    const selection = typeof window.getSelection === "function" ? window.getSelection() : null;
    let savedRange = null;

    try {
      if (selection && selection.rangeCount) savedRange = selection.getRangeAt(0).cloneRange();
    } catch (_) {}

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.tabIndex = -1;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.fontSize = "16px";
    document.body.append(textarea);

    let copied = false;
    try {
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      copied = document.execCommand("copy") === true;
    } catch (_) {
      copied = false;
    } finally {
      textarea.remove();

      if (savedRange && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        } catch (_) {}
      }

      if (activeElement && typeof activeElement.focus === "function") {
        try { activeElement.focus({ preventScroll: true }); } catch (_) {}
      }
    }

    return copied;
  };

  const handleContactCopy = async (username) => {
    const now = Date.now();
    if (copyInProgress || now - lastCopyAttemptAt < 700) return;

    copyInProgress = true;
    lastCopyAttemptAt = now;

    try {
      const copied = await copyTextToClipboard(username);
      showCopyToast(copied ? "success" : "error");
    } catch (_) {
      showCopyToast("error");
    } finally {
      copyInProgress = false;
    }
  };

  const renderContact = () => {
    const container = document.getElementById("contact-methods");
    if (!container) return;

    const contact = config.contact || {};
    const fragment = document.createDocumentFragment();
    const channels = Array.isArray(contact.channels) ? contact.channels : [];
    const list = createElement("div", "contact-channel-list");
    let hasContact = false;

    const buildPlatformIcon = (platform) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      if ((platform || "").toLowerCase().includes("telegram")) {
        path.setAttribute(
          "d",
          "M21 4 3.8 10.6c-.8.3-.8 1.4.1 1.7l4.4 1.4 1.6 5.1c.2.8 1.2.9 1.7.2l2.4-3 4.5 3.5c.6.5 1.6.2 1.8-.6L22 5.4c.2-.9-.6-1.7-1.5-1.4ZM9 13.2l9.2-6.1-7.1 7.2-.4 3.4-1.7-4.5Z"
        );
      } else {
        path.setAttribute(
          "d",
          "M18.8 6.4A15.9 15.9 0 0 0 14.7 5l-.2.4a11 11 0 0 1 3.9 1.9 14.8 14.8 0 0 0-4.8-1.3 16 16 0 0 0-3.2 0 14.8 14.8 0 0 0-4.8 1.3 11 11 0 0 1 3.9-1.9L9.3 5a15.9 15.9 0 0 0-4.1 1.4C2.5 10.3 1.8 14 2.2 17.5a16.6 16.6 0 0 0 5 2.5l1.2-1.9a10.6 10.6 0 0 1-1.9-.9l.5-.4c3.6 1.7 7.4 1.7 11 0l.5.4c-.6.4-1.3.7-1.9.9l1.2 1.9a16.6 16.6 0 0 0 5-2.5c.6-4-.4-7.5-3-11.1ZM9.6 14.9c-.9 0-1.6-.8-1.6-1.9 0-1 .7-1.9 1.6-1.9.9 0 1.6.8 1.6 1.9 0 1-.7 1.9-1.6 1.9Zm4.8 0c-.9 0-1.6-.8-1.6-1.9 0-1 .7-1.9 1.6-1.9.9 0 1.6.8 1.6 1.9 0 1-.7 1.9-1.6 1.9Z"
        );
      }
      svg.append(path);
      return svg;
    };

    const buildCopyIcon = () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");

      const back = document.createElementNS("http://www.w3.org/2000/svg", "path");
      back.setAttribute("d", "M8 8V5.8A1.8 1.8 0 0 1 9.8 4h8.4A1.8 1.8 0 0 1 20 5.8v8.4a1.8 1.8 0 0 1-1.8 1.8H16");
      const front = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      front.setAttribute("x", "4");
      front.setAttribute("y", "8");
      front.setAttribute("width", "12");
      front.setAttribute("height", "12");
      front.setAttribute("rx", "1.8");
      svg.append(back, front);
      return svg;
    };

    channels.forEach((channel) => {
      if (!channel || typeof channel !== "object") return;

      const platform = typeof channel.platform === "string" ? channel.platform.trim() : "";
      const username = typeof channel.username === "string" ? channel.username.trim() : "";
      if (!platform || !username) return;

      const button = createElement("button", "contact-channel");
      button.type = "button";
      button.setAttribute("aria-label", t("copyButtonLabel").replace("{platform}", platform));
      button.setAttribute("title", t("copyButtonTitle"));
      button.addEventListener("click", () => handleContactCopy(username));

      const iconWrap = createElement("span", "contact-channel-icon");
      iconWrap.append(buildPlatformIcon(platform));

      const meta = createElement("span", "contact-channel-meta");
      meta.append(
        createElement("span", "contact-channel-name", platform),
        createElement("span", "contact-channel-handle", username)
      );

      const copyIcon = createElement("span", "contact-channel-copy-icon");
      copyIcon.setAttribute("aria-hidden", "true");
      copyIcon.append(buildCopyIcon());

      button.append(iconWrap, meta, copyIcon);
      list.append(button);
      hasContact = true;
    });

    if (hasContact) {
      fragment.append(list);
      container.replaceChildren(fragment);
    } else {
      container.replaceChildren(createElement("p", "contact-unavailable", t("contactUnavailable")));
    }
  };

  const closeMobileMenu = (returnFocus = false) => {
    const menu = document.getElementById("mobile-navigation");
    const toggle = document.querySelector("[data-menu-toggle]");
    if (!menu || !toggle) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", t("menuOpen"));
    if (returnFocus) toggle.focus();
  };

  const setupMobileMenu = () => {
    const menu = document.getElementById("mobile-navigation");
    const toggle = document.querySelector("[data-menu-toggle]");
    if (!menu || !toggle) return;

    toggle.addEventListener("click", () => {
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      toggle.setAttribute("aria-label", willOpen ? t("menuClose") : t("menuOpen"));
      if (willOpen) {
        const firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMobileMenu(true));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) closeMobileMenu(true);
    });

    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) {
        closeMobileMenu(false);
      }
    });
  };

  const setLanguage = (language, persist = true) => {
    if (!validLanguages.includes(language)) return;
    currentLanguage = language;
    root.lang = language;
    root.dataset.language = language;
    if (persist) safeWrite("floxov-language", language);
    translateStaticContent();
    const profile = config.profile || {};
    const profileImage = document.querySelector("[data-profile-image]");
    if (profileImage) profileImage.alt = t("heroVisualLabel");
    const profileName = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : "FLOXOV";
    document.querySelectorAll("[data-profile-name]").forEach((element) => {
      element.textContent = profileName;
    });
    updateLanguageControls();
    renderProjects();
    renderToolGroups();
    renderContact();
    updateCopyToastContent();
    updateMeta();
    window.dispatchEvent(new CustomEvent("floxov:languagechange", { detail: { language } }));
    const menuToggle = document.querySelector("[data-menu-toggle]");
    if (menuToggle) {
      const menu = document.getElementById("mobile-navigation");
      menuToggle.setAttribute("aria-label", menu && !menu.hidden ? t("menuClose") : t("menuOpen"));
    }
  };

  const setupHeroVideo = () => {
    const stage = document.querySelector("[data-hero-video-stage]");
    if (!stage) return;

    const video = stage.querySelector("[data-hero-video]");
    const poster = stage.querySelector("[data-hero-video-poster]");
    if (!video || !poster) return;

    const settings = config.heroThemeVideos || {};
    const source = settings.dark || "assets/flipper-dark.mp4";
    const posterSource = settings.darkPoster || "assets/flipper-dark-poster.webp";
    const transitionDuration = Number(settings.transitionDuration);

    if (Number.isFinite(transitionDuration) && transitionDuration >= 0 && transitionDuration <= 2000) {
      stage.style.setProperty("--hero-video-transition", `${transitionDuration}ms`);
    }

    const prefersReducedMotion = Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection && connection.saveData);
    const reducedMotion = prefersReducedMotion || saveData;

    poster.src = posterSource;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = reducedMotion ? "none" : "auto";
    video.poster = posterSource;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("tabindex", "-1");
    video.setAttribute("disablepictureinpicture", "");
    video.setAttribute("disableremoteplayback", "");

    const safePlay = () => {
      if (reducedMotion || document.hidden || !video.src) return;
      const playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          video.dataset.autoplayBlocked = "true";
        });
      }
    };

    video.addEventListener("playing", () => {
      video.classList.add("is-playing");
      poster.classList.add("is-covered");
      delete video.dataset.autoplayBlocked;
    });

    video.addEventListener("error", () => {
      video.dataset.mediaError = "true";
      video.classList.remove("is-playing");
      poster.classList.remove("is-covered");
    });

    if (source && !reducedMotion) {
      video.src = source;
      video.load();
      safePlay();
    } else {
      video.dataset.mediaReduced = "true";
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        video.pause();
      } else {
        safePlay();
      }
    });
  };

  const setupLanguageControls = () => {
    root.dataset.theme = "dark";
    root.style.colorScheme = "dark";

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", "#080808");

    document.querySelectorAll(".language-option[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    setLanguage(currentLanguage, false);
  };

  const setupNavigation = () => {
    const header = document.querySelector("[data-header]");
    const navLinks = document.querySelectorAll("[data-nav]");
    const sections = Array.from(document.querySelectorAll("[data-section]"));

    const setActive = (name) => {
      navLinks.forEach((link) => {
        const active = link.dataset.nav === name;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    let initialSection = window.location.hash.replace("#", "");
    if (initialSection === "about") {
      initialSection = "contact";
      try {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#contact`);
        const contactTarget = document.getElementById("contact");
        if (contactTarget) window.requestAnimationFrame(() => contactTarget.scrollIntoView());
      } catch (_) {}
    }
    setActive(["home", "contact"].includes(initialSection) ? initialSection : "home");

    const updateHeader = () => {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      const bar = document.querySelector("[data-scroll-progress]");
      if (bar) bar.style.width = `${progress * 100}%`;
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader, { passive: true });

    if ("IntersectionObserver" in window && sections.length) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.dataset.section);
      }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, .1, .25, .5] });
      sections.forEach((section) => observer.observe(section));
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setActive(link.dataset.nav);
      });
    });
  };

  const setupReveal = () => {
    const revealElements = document.querySelectorAll(
      ".hero-copy-column, .hero-visual, .contact-copy, .contact-actions"
    );
    revealElements.forEach((element, index) => {
      element.setAttribute("data-reveal", "");
      if (index % 3 === 2) element.classList.add("reveal-delay");
    });

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .12, rootMargin: "0px 0px -28px 0px" });
      revealElements.forEach((element) => observer.observe(element));
      body.classList.add("motion-ready");
    } catch (_) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }
  };

  const setupPointerEffect = () => {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = -1000;
    let y = -1000;
    const heroVisual = document.querySelector(".hero-visual");
    window.addEventListener("pointermove", (event) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${x}px`);
        root.style.setProperty("--pointer-y", `${y}px`);
        if (heroVisual) {
          const rect = heroVisual.getBoundingClientRect();
          const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
          const relativeX = inside ? (x - rect.left) / Math.max(1, rect.width) - .5 : 0;
          const relativeY = inside ? (y - rect.top) / Math.max(1, rect.height) - .5 : 0;
          heroVisual.style.setProperty("--parallax-x", `${relativeX * 7}px`);
          heroVisual.style.setProperty("--parallax-y", `${relativeY * 7}px`);
        }
        frame = 0;
      });
    }, { passive: true });
    if (heroVisual) {
      heroVisual.addEventListener("pointerleave", () => {
        heroVisual.style.setProperty("--parallax-x", "0px");
        heroVisual.style.setProperty("--parallax-y", "0px");
      });
    }
  };

  // Keep the page useful if storage is blocked or a configuration value is missing.
  try {
    setupLanguageControls();
    setupHeroVideo();
    setupBrandLogo();
    setupProfileImage();
    setupAvatarGlitch();
    setupContactBackgroundVideo();
    renderProjects();
    renderContact();
    setupMobileMenu();
    setupNavigation();
    setupReveal();
    setupPointerEffect();
  } catch (error) {
    body.classList.remove("motion-ready");
    document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
    if (window.console && typeof console.warn === "function") {
      console.warn("FLOXOV enhancement script encountered a non-fatal issue.", error);
    }
  }
})();
