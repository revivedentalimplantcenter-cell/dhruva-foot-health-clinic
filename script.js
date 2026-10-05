(function () {
  "use strict";

  var progressBar = document.getElementById("progressBar");
  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll progress bar + header shadow ---------- */
  var ticking = false;
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
    progressBar.style.transform = "scaleX(" + p + ")";
    header.classList.toggle("scrolled", (window.scrollY || 0) > 12);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Scroll-reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Scrollspy: active nav link ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav > a.nav-link"));
  var spySections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  function setActive(id) {
    spyLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    mainNav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  mainNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Mobile: tap Treatments to expand submenu ---------- */
  var dropdownToggle = document.querySelector(".dropdown-toggle");
  var dropdown = document.querySelector(".nav-dropdown");
  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener("click", function (e) {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        var expanded = dropdown.classList.toggle("expanded");
        dropdownToggle.setAttribute("aria-expanded", String(expanded));
      }
    });
  }

  /* ---------- Close mobile menu on resize to desktop ---------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) closeMenu();
  });
})();
