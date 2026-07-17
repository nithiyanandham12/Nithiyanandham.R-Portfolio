/* =========================================================
   Scroll-choreographed interactions:
   curtain loader → char reveals → full-page color morph →
   pinned horizontal project gallery → velocity marquee.
   No mouse-move effects by design.
   ========================================================= */
(function () {
  "use strict";

  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  var lenis = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    startClock();

    if (!hasGsap) {
      // Graceful fallback: show everything, skip animations
      document.querySelectorAll("[data-fade]").forEach(function (el) {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
      var loaderEl = document.getElementById("loader");
      if (loaderEl) loaderEl.style.display = "none";
      return;
    }

    splitChars();
    splitWords();
    initSmoothScroll();
    runLoader();
    initThemeMorph();
    initTitleReveals();
    initFadeReveals();
    initAboutLead();
    initAboutImageParallax();
    initSkillRows();
    initExperience();
    initHorizontalProjects();
    initMarquee();
    initCounters();
    initSectionLabel();
    initProgress();
    initBurger();
    initBackTop();
  }

  /* ---------------- Utilities ---------------- */
  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function startClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    function tick() {
      var d = new Date();
      el.textContent =
        String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
    tick();
    setInterval(tick, 30000);
  }

  /* ---------------- Text splitting ---------------- */
  function splitElementChars(el) {
    var words = el.textContent.split(/\s+/).filter(Boolean);
    el.textContent = "";
    var frag = document.createDocumentFragment();
    words.forEach(function (word, wi) {
      // Word wrapper keeps line-breaks at word boundaries only
      var w = document.createElement("span");
      w.className = "char-word";
      Array.prototype.forEach.call(word, function (ch) {
        var s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        w.appendChild(s);
      });
      frag.appendChild(w);
      if (wi < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });
    el.appendChild(frag);
  }

  function splitChars() {
    document.querySelectorAll("[data-chars]").forEach(splitElementChars);
    var ln = document.getElementById("loaderName");
    var lr = document.getElementById("loaderRole");
    if (ln) splitElementChars(ln);
    if (lr) splitElementChars(lr);
  }

  function splitWords() {
    document.querySelectorAll("[data-words]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (w, i) {
        var s = document.createElement("span");
        s.className = "word";
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------------- Smooth scroll ---------------- */
  function initSmoothScroll() {
    if (typeof window.Lenis === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      anchors: { offset: -20 }
    });

    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (hasST) lenis.on("scroll", ScrollTrigger.update);
  }

  /* ---------------- Loader → hero intro ---------------- */
  function runLoader() {
    var loader = document.getElementById("loader");
    var nameChars = loader ? loader.querySelectorAll("#loaderName .char") : [];
    var roleChars = loader ? loader.querySelectorAll("#loaderRole .char") : [];
    var panels = loader ? loader.querySelectorAll(".loader-panels span") : [];
    var heroChars1 = document.querySelectorAll(".hero-line-1 .char");
    var heroChars2 = document.querySelectorAll(".hero-line-2 .char");
    var heroFades = document.querySelectorAll(".hero [data-fade]");
    var heroPhoto = document.getElementById("heroPhoto");
    var heroGlow = heroPhoto ? heroPhoto.querySelector(".cutout-glow") : null;
    var heroImg = heroPhoto ? heroPhoto.querySelector("img") : null;

    if (lenis) lenis.stop();

    gsap.set(heroChars1, { yPercent: 120 });
    gsap.set(heroChars2, { yPercent: 120 });
    if (heroImg) gsap.set(heroImg, { clipPath: "inset(100% 0 0 0)", yPercent: 10 });
    if (heroGlow) gsap.set(heroGlow, { opacity: 0 });

    var tl = gsap.timeline({
      onComplete: function () {
        if (loader) loader.style.display = "none";
        if (lenis) lenis.start();
        if (hasST) ScrollTrigger.refresh();
      }
    });

    if (nameChars.length) {
      tl.from(nameChars, { yPercent: 130, opacity: 0, duration: 0.7, ease: "power4.out", stagger: 0.035 });
      tl.from(roleChars, { opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.012 }, "-=0.35");
      tl.to({}, { duration: 0.45 });
      tl.to([nameChars, roleChars], { yPercent: -130, opacity: 0, duration: 0.5, ease: "power3.in", stagger: 0.01 });
    }

    if (panels.length) {
      tl.to(panels, { scaleY: 0, duration: 0.85, ease: "power4.inOut", stagger: 0.08 }, "-=0.15");
    }

    tl.to(heroChars1, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.05 }, "-=0.55");
    tl.to(heroChars2, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.05 }, "-=0.85");
    if (heroGlow) {
      tl.to(heroGlow, { opacity: 1, duration: 1.2, ease: "power2.out" }, "-=0.8");
    }
    if (heroImg) {
      tl.to(heroImg, { clipPath: "inset(0% 0 0 0)", yPercent: 0, duration: 1.3, ease: "power4.out" }, "-=1.0");
    }
    tl.to(heroFades, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 }, "-=0.7");
  }

  /* ---------------- Full-page color morph per section ---------------- */
  function initThemeMorph() {
    var themes = {
      base:    { "--bg": "#f2efe9", "--fg": "#121014", "--accent": "#4b2fd6" },
      ink:     { "--bg": "#121014", "--fg": "#f2efe9", "--accent": "#8f6bff" },
      violet:  { "--bg": "#4b2fd6", "--fg": "#f4f1ff", "--accent": "#ffd53d" },
      crimson: { "--bg": "#f6ddc6", "--fg": "#16100e", "--accent": "#4b2fd6" }
    };

    var root = document.documentElement;
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[data-theme]"));
    var current = "base";
    var pending = false;

    function applyTheme(name) {
      if (name === current) return;
      current = name;
      var t = themes[name] || themes.base;
      gsap.to(root, {
        "--bg": t["--bg"],
        "--fg": t["--fg"],
        "--accent": t["--accent"],
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: "auto"
      });
    }

    // Pick the theme of whichever section covers the viewport center.
    // Rect-based so it stays correct inside pinned (transformed) sections.
    function evaluate() {
      pending = false;
      var mid = window.innerHeight * 0.5;
      var found = "base";
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          found = sections[i].dataset.theme;
          break;
        }
      }
      applyTheme(found);
    }

    function requestEvaluate() {
      if (!pending) {
        pending = true;
        requestAnimationFrame(evaluate);
      }
    }

    window.addEventListener("scroll", requestEvaluate, { passive: true });
    window.addEventListener("resize", requestEvaluate);
    evaluate();
  }

  /* ---------------- Section title char reveals ---------------- */
  function initTitleReveals() {
    if (!hasST) return;

    document.querySelectorAll(".sec-title [data-chars], .contact-line [data-chars]").forEach(function (el) {
      var chars = el.querySelectorAll(".char");
      if (!chars.length) return;
      gsap.set(chars, { yPercent: 120 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(chars, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.035 });
        }
      });
    });
  }

  /* ---------------- Generic fade-up reveals ---------------- */
  function initFadeReveals() {
    var els = Array.prototype.filter.call(
      document.querySelectorAll("[data-fade]"),
      function (el) { return !el.closest(".hero"); }
    );
    if (!els.length) return;

    if (!hasST) {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6 });
      return;
    }

    ScrollTrigger.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
      }
    });
  }

  /* ---------------- About lead: word-by-word scrub ---------------- */
  function initAboutLead() {
    if (!hasST) return;
    document.querySelectorAll("[data-words]").forEach(function (el) {
      var words = el.querySelectorAll(".word");
      if (!words.length) return;
      gsap.to(words, {
        opacity: 1,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          end: "bottom 45%",
          scrub: 0.4
        }
      });
    });
  }

  /* ---------------- About image: glow + wipe-up reveal ---------------- */
  function initAboutImageParallax() {
    if (!hasST) return;
    var wrap = document.querySelector(".about-img");
    var glow = wrap ? wrap.querySelector(".cutout-glow") : null;
    var img = wrap ? wrap.querySelector("img") : null;
    if (!wrap || !img) return;

    gsap.set(img, { clipPath: "inset(100% 0 0 0)", yPercent: 10 });
    if (glow) gsap.set(glow, { opacity: 0 });

    ScrollTrigger.create({
      trigger: wrap,
      start: "top 78%",
      once: true,
      onEnter: function () {
        if (glow) gsap.to(glow, { opacity: 1, duration: 1.2, ease: "power2.out" });
        gsap.to(img, { clipPath: "inset(0% 0 0 0)", yPercent: 0, duration: 1.3, ease: "power4.out", delay: 0.1 });
      }
    });
  }

  /* ---------------- Skill rows: staggered clip reveal ---------------- */
  function initSkillRows() {
    if (!hasST) return;
    document.querySelectorAll("[data-skill]").forEach(function (row) {
      var inner = row.querySelector(".skill-row-inner");
      gsap.set(row, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(inner, { y: 60 });
      ScrollTrigger.create({
        trigger: row,
        start: "top 90%",
        once: true,
        onEnter: function () {
          gsap.to(row, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.out" });
          gsap.to(inner, { y: 0, duration: 0.9, ease: "power4.out" });
        }
      });
    });
  }

  /* ---------------- Experience: line draw + content rise ---------------- */
  function initExperience() {
    if (!hasST) return;
    document.querySelectorAll("[data-exp]").forEach(function (item) {
      var meta = item.querySelector(".exp-meta");
      var body = item.querySelector(".exp-body");
      var dot = item.querySelector(".exp-dot");

      gsap.set([meta, body], { opacity: 0, y: 44 });
      if (dot) gsap.set(dot, { scale: 0 });

      ScrollTrigger.create({
        trigger: item,
        start: "top 80%",
        once: true,
        onEnter: function () {
          item.classList.add("line-drawn");
          if (dot) gsap.to(dot, { scale: 1, duration: 0.5, ease: "back.out(2.5)" });
          gsap.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
          gsap.to(body, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.25 });
        }
      });
    });
  }

  /* ---------------- Projects: pinned horizontal gallery ---------------- */
  function initHorizontalProjects() {
    if (!hasST) return;

    ScrollTrigger.matchMedia({
      "(min-width: 861px)": function () {
        var track = document.getElementById("projTrack");
        var pin = document.getElementById("projPin");
        if (!track || !pin) return;

        function distance() {
          return Math.max(0, track.scrollWidth - window.innerWidth + 80);
        }

        gsap.to(track, {
          x: function () { return -distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: ".proj",
            start: "top top",
            end: function () { return "+=" + distance(); },
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
          }
        });

        // Cards drift in as the gallery starts
        gsap.from(".proj-card", {
          opacity: 0,
          x: 120,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".proj", start: "top 70%", once: true }
        });
      },
      "(max-width: 860px)": function () {
        gsap.utils.toArray(".proj-card").forEach(function (card) {
          gsap.from(card, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true }
          });
        });
      }
    });
  }

  /* ---------------- Marquee: infinite loop + scroll-velocity skew ---------------- */
  function initMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;

    var loop = gsap.to(track, {
      xPercent: -50,
      duration: 24,
      ease: "none",
      repeat: -1
    });

    if (!hasST) return;

    var proxy = { skew: 0 };
    var skewSetter = gsap.quickSetter(track, "skewX", "deg");
    var clamp = gsap.utils.clamp(-8, 8);

    ScrollTrigger.create({
      onUpdate: function (self) {
        var skew = clamp(self.getVelocity() / -280);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.7,
            ease: "power3",
            overwrite: true,
            onUpdate: function () { skewSetter(proxy.skew); }
          });
        }
        // Scroll velocity also nudges the loop speed
        loop.timeScale(gsap.utils.clamp(0.6, 3, 1 + Math.abs(self.getVelocity()) / 1500));
        gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: "auto" });
      }
    });
  }

  /* ---------------- Counters ---------------- */
  function initCounters() {
    document.querySelectorAll(".astat-num").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var obj = { v: 0 };

      var play = function () {
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: function () { el.textContent = Math.floor(obj.v); }
        });
      };

      if (hasST) {
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: play });
      } else {
        play();
      }
    });
  }

  /* ---------------- Fixed section label ---------------- */
  function initSectionLabel() {
    var label = document.getElementById("sectionLabel");
    if (!label || !hasST) return;

    document.querySelectorAll("[data-label]").forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: function () { label.textContent = sec.dataset.label; },
        onEnterBack: function () { label.textContent = sec.dataset.label; }
      });
    });
  }

  /* ---------------- Scroll progress ---------------- */
  function initProgress() {
    var bar = document.getElementById("progress");
    if (!bar) return;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------------- Mobile menu ---------------- */
  function initBurger() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("navMenu");
    var nav = document.getElementById("nav");
    if (!burger || !menu) return;

    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      nav.classList.toggle("menu-open");
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        nav.classList.remove("menu-open");
      });
    });
  }

  /* ---------------- Back to top ---------------- */
  function initBackTop() {
    var btn = document.getElementById("backTop");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
