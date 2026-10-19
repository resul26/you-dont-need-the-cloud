/* You Don't Need The Cloud — shared interactions.
   No wall-clock loops in diagrams: everything GSAP-driven, scroll-activated. */
(function () {
  "use strict";

  /* ---------- Reading progress ---------- */
  var bar = document.querySelector(".read-progress");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  var rvEls = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  var settleReveals = function () {
    rvEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  };
  if (rvEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rvEls.forEach(function (el) { io.observe(el); });
    /* Fallback: IO callbacks can stall in headless/virtual-time contexts.
       After 1.2s, force-reveal anything in the viewport. */
    setTimeout(settleReveals, 1200);
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Diagram helper: build a paused GSAP timeline per diagram ---------- */
  var DIAGRAMS = {};
  window.DIAGRAMS = DIAGRAMS;

  function registerDiagram(id, builder) {
    var host = document.getElementById(id);
    if (!host) return;
    DIAGRAMS[id] = { host: host, builder: builder, tl: null, built: false };
  }
  window.registerDiagram = registerDiagram;

  /* drain pre-registration queue (inline widget scripts ran before site.js) */
  if (Array.isArray(window.__dq)) {
    window.__dq.forEach(function (item) { registerDiagram(item.id, item.fn); });
    window.__dq = [];
  }

  function buildDiagram(d) {
    if (d.built || typeof gsap === "undefined") return;
    d.tl = gsap.timeline({ paused: true });
    d.builder(d.tl, d.host);
    /* If the builder did not place any tweens on the timeline
       (e.g. all animation was hand-rolled), give it a no-op duration
       so progress/duration logic stays sane. */
    if (d.tl.duration() === 0) d.tl.to({}, { duration: .5 });
    d.built = true;
    // wire controls
    var playBtn = d.host.querySelector('[data-act="play"]');
    var replayBtn = d.host.querySelector('[data-act="replay"]');
    var scrub = d.host.querySelector('[data-act="scrub"]');
    var dur = d.tl.duration();
    if (scrub) scrub.max = dur.toFixed(2), scrub.step = (dur / 200).toFixed(3);
    if (playBtn) playBtn.addEventListener("click", function () {
      if (d.tl.paused() && d.tl.progress() < 1) { d.tl.play(); }
      else { d.tl.pause(); }
      playBtn.textContent = d.tl.paused() ? "Play" : "Pause";
      playBtn.classList.toggle("on", !d.tl.paused());
    });
    if (replayBtn) replayBtn.addEventListener("click", function () {
      d.tl.pause(0); d.tl.play(0);
      if (playBtn) playBtn.textContent = "Pause";
    });
    if (scrub) scrub.addEventListener("input", function () {
      d.tl.pause(); d.tl.seek(parseFloat(scrub.value));
      if (playBtn) playBtn.textContent = "Play";
    });
    var pulseEls = d.host.querySelectorAll("[data-loop-pulse]");
    pulseEls.forEach(function (p) {
      gsap.to(p, {
        attr: { r: parseFloat(p.getAttribute("r") || 4) * 2.2 },
        opacity: 0, duration: 1.6, repeat: -1, ease: "power1.out"
      });
    });
  }

  /* ---------- Scroll-triggered autoplay for diagrams ---------- */
  var dHosts = Array.prototype.slice.call(document.querySelectorAll(".diagram[data-autoplay]"));
  if (dHosts.length && "IntersectionObserver" in window && typeof gsap !== "undefined") {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id, d = DIAGRAMS[id];
        if (!d) return;
        if (e.isIntersecting) {
          if (!d.built) buildDiagram(d);
          if (d.tl && d.tl.paused() && d.tl.progress() === 0) {
            d.tl.play(0);
          }
        } else if (d.tl && !d.tl.paused()) {
          d.tl.pause();
        }
      });
    }, { threshold: 0.35 });
    dHosts.forEach(function (h) { dio.observe(h); });
  }

  /* ---------- Build all non-autoplay diagrams immediately (scrub-only) ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    Object.keys(DIAGRAMS).forEach(function (id) {
      var d = DIAGRAMS[id];
      if (!d.host.hasAttribute("data-autoplay")) buildDiagram(d);
    });
  });

  /* Fallback for environments where IO doesn't fire (headless captures etc.):
     after 2.5s, if a diagram is inside the viewport but never started, force it
     to final state. Real browsers with working IO/scroll never hit this. */
  setTimeout(function () {
    Object.keys(DIAGRAMS).forEach(function (id) {
      var d = DIAGRAMS[id];
      if (!d.built) buildDiagram(d);
      if (!d.tl) return;
      var r = d.host.getBoundingClientRect();
      var inView = r.top < window.innerHeight && r.bottom > 0;
      if (d.tl.progress() === 0 && inView && d.tl.paused()) d.tl.progress(1);
    });
  }, 2500);
})();
