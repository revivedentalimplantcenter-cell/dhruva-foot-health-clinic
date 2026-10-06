/* Dhruva Foot Health Clinic — minimal behaviour.
   One orchestrated motion moment: hero rise (CSS) + journey path draw (below).
   Everything else is functional: nav, FAQ, back-to-top. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mainNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var ans = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---------- Journey path draw (the one scroll moment) ---------- */
  var journey = document.querySelector(".journey");
  var path = document.getElementById("pathDraw");
  if (journey && path && !reduceMotion) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    var ticking = false;
    function drawPath() {
      ticking = false;
      var r = journey.getBoundingClientRect();
      var vh = window.innerHeight;
      // progress: 0 when journey top hits viewport bottom, 1 when bottom passes middle
      var start = r.top + window.scrollY - vh + vh * 0.15;
      var end = r.top + window.scrollY + r.height - vh * 0.45;
      var y = window.scrollY;
      var p = (y - start) / Math.max(1, end - start);
      p = Math.min(1, Math.max(0, p));
      // ease the draw slightly
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      path.style.strokeDashoffset = len * (1 - eased);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(drawPath);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    drawPath();
  } else if (path) {
    path.style.strokeDasharray = "none";
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Active nav link ---------- */
  var links = document.querySelectorAll(".main-nav > .nav-link[href^='#'], .dropdown-menu a");
  var sections = [];
  links.forEach(function (l) {
    var id = l.getAttribute("href");
    if (id && id.length > 1) {
      var s = document.querySelector(id);
      if (s) sections.push({ link: l, el: s });
    }
  });
  if ("IntersectionObserver" in window && sections.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          document.querySelectorAll(".main-nav .nav-link").forEach(function (l) {
            l.classList.remove("active");
          });
          sections.forEach(function (s) {
            if (s.el === e.target && s.link.classList.contains("nav-link")) {
              s.link.classList.add("active");
            }
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { obs.observe(s.el); });
  }
})();
