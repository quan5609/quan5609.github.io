/* =====================================================================
   Minh-Quan Viet Bui - portfolio interactions (vanilla JS, no deps)
   - theme toggle (persisted)
   - mobile menu
   - header + back-to-top state via IntersectionObserver (no scroll listener)
   - scroll-reveal with per-group stagger
   - active nav link tracking
   - publication filtering
   - BibTeX cite expand/collapse
   ===================================================================== */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------- Theme toggle --------------------------- */
  const themeColorMeta = document.getElementById("theme-color-meta");
  function syncThemeColor() {
    if (!themeColorMeta) return;
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (bg) themeColorMeta.setAttribute("content", bg);
  }
  syncThemeColor();

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
      syncThemeColor();
    });
  }

  /* --------------------------- Mobile menu ---------------------------- */
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      const icon = menuToggle.querySelector("i");
      if (icon) { icon.className = "ph ph-list"; }
    }
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      const icon = menuToggle.querySelector("i");
      if (icon) { icon.className = open ? "ph ph-x" : "ph ph-list"; }
      if (open) {
        // Defer one frame: the nav transitions from visibility:hidden,
        // so it is not focusable on the same tick the class is added.
        const first = nav.querySelector("a");
        if (first) requestAnimationFrame(() => first.focus());
      }
    });

    // Escape closes the open menu and returns focus to the toggle.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // Close the mobile menu after following an in-page link.
  document.querySelectorAll('.nav-list a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Header + back-to-top state (sentinel observer) ---------- */
  const header = document.getElementById("site-header");
  const toTop = document.getElementById("to-top");
  const sentinel = document.getElementById("top-sentinel");

  if (sentinel && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        const scrolled = !entry.isIntersecting;
        if (header) header.classList.toggle("scrolled", scrolled);
        if (toTop) toTop.classList.toggle("show", scrolled);
      },
      { rootMargin: "0px" }
    );
    headerObserver.observe(sentinel);
  }

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------- Scroll reveal -------------------------- */
  const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    // Cascade reveals that share a parent container.
    const groups = new Map();
    reveals.forEach((el) => {
      const parent = el.parentElement;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });
    groups.forEach((list) => {
      list.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i, 6) * 70 + "ms";
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------ Active nav tracking ----------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ------------------------ Publication filter ------------------------ */
  const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
  const pubCards = Array.from(document.querySelectorAll(".pub-card"));

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => {
        b.classList.toggle("active", b === this);
        b.setAttribute("aria-pressed", String(b === this));
      });
      const filter = this.getAttribute("data-filter");

      pubCards.forEach((card) => {
        const match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ----------------------- BibTeX cite expand ------------------------- */
  document.querySelectorAll(".cite-link").forEach((citeLink) => {
    citeLink.addEventListener("click", (e) => {
      e.preventDefault();

      const container = citeLink.closest(".publication-content");
      if (!container) return;

      // Toggle off if already open.
      const existing = container.querySelector(".citation-text");
      if (existing) {
        existing.remove();
        citeLink.setAttribute("aria-expanded", "false");
        return;
      }

      const citationText = citeLink.getAttribute("data-citation") || "";
      const pre = document.createElement("pre");
      pre.className = "citation-text";
      pre.setAttribute("aria-label", "BibTeX citation");
      pre.setAttribute("role", "region");

      // data-citation stores lines joined by a literal "\n".
      citationText.split("\\n").forEach((line, index) => {
        const code = document.createElement("code");
        code.textContent = line;
        if (!reduceMotion) {
          code.style.opacity = "0";
          code.style.transition = "opacity .12s ease";
          setTimeout(() => { code.style.opacity = "1"; }, index * 40);
        }
        pre.appendChild(code);
        pre.appendChild(document.createElement("br"));
      });

      container.appendChild(pre);
      citeLink.setAttribute("aria-expanded", "true");
    });
  });
})();
