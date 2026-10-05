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

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  var preloaderHidden = false;
  function hidePreloader() {
    if (preloaderHidden || !preloader) return;
    preloaderHidden = true;
    preloader.classList.add("done");
    setTimeout(function () { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 700);
  }
  window.addEventListener("load", function () {
    setTimeout(hidePreloader, reduceMotion ? 0 : 450);
  });
  setTimeout(hidePreloader, 4000); /* safety */

  /* ---------- Hero headline: word-by-word reveal ---------- */
  var heroH1 = document.querySelector(".hero h1");
  if (heroH1 && !reduceMotion) {
    var fragNodes = Array.prototype.slice.call(heroH1.childNodes);
    heroH1.innerHTML = "";
    var wi = 0;
    fragNodes.forEach(function (n) {
      var isEm = n.nodeType === 1;
      n.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          heroH1.appendChild(document.createTextNode(" "));
          return;
        }
        var mask = document.createElement("span");
        mask.className = "w-mask";
        var w = document.createElement("span");
        w.className = "w" + (isEm ? " gold-w em-w" : "");
        w.textContent = part;
        w.style.setProperty("--wd", (0.55 + wi * 0.07).toFixed(2) + "s");
        mask.appendChild(w);
        heroH1.appendChild(mask);
        wi++;
      });
    });
    heroH1.classList.remove("anim");
    heroH1.style.opacity = "1";
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cio.unobserve(el);
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
        var start = null, dur = 1500;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Pointer-driven effects (fine pointers only) ---------- */
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !reduceMotion) {

    /* Hero photo parallax on scroll */
    var heroPhoto = document.querySelector(".hero-photo");
    var heroSection = document.querySelector(".hero");
    if (heroPhoto && heroSection) {
      var photoTicking = false;
      window.addEventListener("scroll", function () {
        if (photoTicking) return;
        photoTicking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          var h = heroSection.offsetHeight;
          if (y < h * 1.2) {
            heroPhoto.style.translate = "0 " + (y * 0.22).toFixed(1) + "px";
          }
          photoTicking = false;
        });
      }, { passive: true });
    }

    /* Spotlight glow tracking on cards */
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* Magnetic buttons */
    document.querySelectorAll(".hero-actions .btn, .thursday-inner .btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.18).toFixed(1) + "px," + (y * 0.3).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });

    /* 3D tilt on doctor cards */
    document.querySelectorAll(".doctor").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-py * 7).toFixed(2) +
          "deg) rotateY(" + (px * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = "0px";
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", (window.scrollY || 0) > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Close mobile menu on resize to desktop ---------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) closeMenu();
  });
})();
