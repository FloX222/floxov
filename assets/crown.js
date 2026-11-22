/* Crown enhancement: no dependencies and no modifications to the existing profile/glitch pipeline. */
(() => {
  "use strict";
  const crown = document.querySelector("[data-floating-crown]");
  const hero = document.querySelector(".hero-visual");
  const frame = document.querySelector("[data-profile-frame]");
  const video = document.querySelector("[data-crown-video]");
  const image = document.querySelector("[data-crown-image]");
  if (!crown || !hero || !frame || !video || !image) return;

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(connection && connection.saveData);
  const isWebKitMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|chromium|android|crios|fxios).)*safari/i.test(navigator.userAgent);
  const animatedImage = "./assets/crown-alpha.webp";
  const poster = "./assets/crown-poster.png";
  const allowMotion = () => !motionPreference.matches && !saveData;
  const supportsVideo = !!video.canPlayType('video/webm; codecs="vp9"') && !isSafari && !isWebKitMobile;
  let isVisible = true;
  let loadedWebm = false;
  let raf = 0;

  function position() {
    raf = 0;
    const tile = frame.getBoundingClientRect();
    const parent = hero.getBoundingClientRect();
    if (!tile.width || !parent.width) return;
    // Crown stays anchored to the transformed avatar, across all breakpoint layouts.
    const width = tile.width * 1.15;
    const height = width * (240 / 420);
    const left = tile.left - parent.left + tile.width / 2 - width / 2;
    const top = tile.top - parent.top - height * .83;
    crown.style.setProperty("--crown-width", `${width.toFixed(2)}px`);
    crown.style.setProperty("--crown-left", `${left.toFixed(2)}px`);
    crown.style.setProperty("--crown-top", `${top.toFixed(2)}px`);
    crown.classList.add("is-ready");
  }
  function requestPosition() {
    if (!raf) raf = requestAnimationFrame(position);
  }
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(requestPosition) : null;
  if (ro) { ro.observe(frame); ro.observe(hero); }
  window.addEventListener("resize", requestPosition, { passive: true });
  window.addEventListener("orientationchange", requestPosition, { passive: true });
  frame.addEventListener("transitionrun", requestPosition);
  frame.addEventListener("transitionend", requestPosition);
  // Existing avatar uses transform/translate for hover/parallax; track pointer changes locally.
  hero.addEventListener("pointermove", requestPosition, { passive: true });
  hero.addEventListener("pointerleave", requestPosition, { passive: true });
  requestPosition();
  document.fonts && document.fonts.ready.then(requestPosition).catch(() => {});

  function updatePlayback() {
    const playing = allowMotion() && isVisible && !document.hidden;
    image.src = playing ? animatedImage : poster;
    if (!supportsVideo || !playing) {
      video.pause();
      video.hidden = true;
      image.hidden = false;
      return;
    }
    if (!loadedWebm) {
      loadedWebm = true;
      video.src = "./assets/crown-alpha.webm";
      video.load();
    }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => {
      video.hidden = true;
      image.hidden = false;
    });
  }
  video.addEventListener("playing", () => {
    if (allowMotion() && isVisible && !document.hidden) {
      video.hidden = false;
      image.hidden = true;
    }
  });
  video.addEventListener("error", () => {
    video.hidden = true;
    image.hidden = false;
  });
  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      updatePlayback();
    }, { rootMargin: "100px" });
    observer.observe(crown);
  }
  document.addEventListener("visibilitychange", updatePlayback);
  motionPreference.addEventListener?.("change", updatePlayback);
  if (connection && connection.addEventListener) connection.addEventListener("change", updatePlayback);
  updatePlayback();
})();
