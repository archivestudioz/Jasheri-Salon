// Jaesheri House of Beauty — main.js

// Mobile nav toggle
const toggle = document.querySelector(".nav__toggle");
const menus = document.querySelectorAll(".nav__menu");
if (toggle && menus.length) {
  const setOpen = (open) => {
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menus.forEach((m) => m.classList.toggle("open", open));
    document.body.classList.toggle("nav-open", open);
  };
  const closeMenu = () => setOpen(false);
  toggle.addEventListener("click", () => setOpen(!toggle.classList.contains("open")));
  document
    .querySelectorAll(".nav__menu a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// Nav scrolled state
const nav = document.querySelector(".nav");
const onScroll = () => {
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal-on-scroll (with stagger for grid children)
const STAGGER_SELECTORS = ".grid--3 .card, .gallery__item";
document.querySelectorAll(STAGGER_SELECTORS).forEach((el, i) => {
  // Index within parent group (limit max delay)
  const siblings = el.parentElement?.children;
  let idx = 0;
  if (siblings) {
    for (const sib of siblings) {
      if (sib === el) break;
      if (sib.matches(STAGGER_SELECTORS)) idx++;
    }
  }
  el.style.transitionDelay = Math.min(idx, 7) * 70 + "ms";
  el.classList.add("reveal", "reveal--stagger");
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Highlight current nav link based on pathname
const path = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav__menu a").forEach((a) => {
  const href = a.getAttribute("href");
  if (href === path || (path === "" && href === "index.html")) {
    a.classList.add("active");
  }
});

// ============ Booking side panel ============
(() => {
  const SQUARE_BASE =
    "https://book.squareup.com/appointments/wtcavgdh941lv1/location/T7Z3E3GAA7CZT";

  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const formatPrice = (cents) =>
    typeof cents === "number"
      ? "$" + (cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2))
      : "";
  const formatDuration = (min) => (min ? `${min} min` : "");

  const panel = document.createElement("aside");
  panel.className = "book-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.setAttribute("aria-label", "Book an appointment");
  panel.innerHTML = `
    <div class="book-panel__backdrop" data-book-close></div>
    <div class="book-panel__inner" role="dialog" aria-modal="true">
      <header class="book-panel__head">
        <button class="book-panel__back" type="button" aria-label="Back to services" hidden>&larr;</button>
        <span class="book-panel__eyebrow">Book Now</span>
        <button class="book-panel__close" type="button" aria-label="Close booking panel" data-book-close>&times;</button>
      </header>
      <div class="book-panel__screens">
        <div class="book-panel__screen book-panel__screen--menu" data-screen="menu">
          <div class="bp-tabs-wrap">
            <nav class="bp-tabs" aria-label="Service categories" aria-busy="true"></nav>
            <span class="bp-tabs-more bp-tabs-more--right" aria-hidden="true">&rsaquo;</span>
            <span class="bp-tabs-more bp-tabs-more--left" aria-hidden="true">&lsaquo;</span>
          </div>
          <div class="book-panel__menu" aria-busy="true">Loading services&hellip;</div>
        </div>
        <div class="book-panel__screen book-panel__screen--book" data-screen="book" hidden></div>
      </div>
      <footer class="book-panel__foot">
        <a href="${SQUARE_BASE}" target="_blank" rel="noopener">Open in a new tab &rarr;</a>
      </footer>
    </div>
  `;
  document.body.appendChild(panel);

  const menuEl = panel.querySelector(".book-panel__menu");
  const tabsEl = panel.querySelector(".bp-tabs");
  const tabsWrap = panel.querySelector(".bp-tabs-wrap");
  const screenMenu = panel.querySelector('[data-screen="menu"]');
  const screenBook = panel.querySelector('[data-screen="book"]');
  const backBtn = panel.querySelector(".book-panel__back");

  const updateTabsOverflow = () => {
    const max = tabsEl.scrollWidth - tabsEl.clientWidth;
    const left = tabsEl.scrollLeft;
    tabsWrap.classList.toggle("bp-tabs-wrap--more-right", max > 0 && left < max - 2);
    tabsWrap.classList.toggle("bp-tabs-wrap--more-left", left > 2);
  };
  tabsEl.addEventListener("scroll", updateTabsOverflow, { passive: true });
  window.addEventListener("resize", updateTabsOverflow);

  let dataLoaded = false;
  let dataLoadPromise = null;
  let menuData = null;
  let activeCatId = null;

  const renderServices = (catId) => {
    const services = menuData.svcsByCat[catId] || [];
    const cat = menuData.cats.find((c) => c.id === catId);
    menuEl.innerHTML = `
      <h3 class="bp-cat-title">${escapeHtml(cat?.name || "")}</h3>
      <ul class="bp-svcs">
        ${services
          .map(
            (s) => `
          <li>
            <button class="bp-svc" type="button" data-svc-id="${escapeHtml(s.id)}" data-svc-name="${escapeHtml(s.name)}">
              <span class="bp-svc__top">
                <span class="bp-svc__name">${escapeHtml(s.name)}</span>
                <span class="bp-svc__price">${escapeHtml(formatPrice(s.price_cents))}</span>
              </span>
              <span class="bp-svc__meta">${escapeHtml(formatDuration(s.duration_min))}</span>
            </button>
          </li>`
          )
          .join("")}
      </ul>
    `;
    menuEl.scrollTop = 0;
  };

  const setActiveCat = (catId) => {
    activeCatId = catId;
    tabsEl.querySelectorAll(".bp-tab").forEach((t) => {
      const active = t.dataset.catId === catId;
      t.classList.toggle("bp-tab--active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      if (active) t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    renderServices(catId);
  };

  const renderMenu = (data) => {
    const cats = [...data.categories].sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0));
    const svcsByCat = {};
    for (const s of data.services) {
      (svcsByCat[s.category_id] = svcsByCat[s.category_id] || []).push(s);
    }
    for (const id in svcsByCat) {
      svcsByCat[id].sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0));
    }
    const populatedCats = cats.filter((c) => svcsByCat[c.id]?.length);
    menuData = { cats: populatedCats, svcsByCat };
    tabsEl.innerHTML = populatedCats
      .map(
        (c) => `
        <button class="bp-tab" type="button" role="tab" data-cat-id="${escapeHtml(c.id)}" aria-selected="false">
          ${escapeHtml(c.name)}
        </button>`
      )
      .join("");
    tabsEl.removeAttribute("aria-busy");
    menuEl.removeAttribute("aria-busy");
    if (populatedCats.length) setActiveCat(populatedCats[0].id);
    requestAnimationFrame(updateTabsOverflow);
  };

  const loadData = () => {
    if (dataLoadPromise) return dataLoadPromise;
    dataLoadPromise = fetch("js/services-data.json")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        dataLoaded = true;
        renderMenu(data);
        return data;
      })
      .catch((err) => {
        menuEl.innerHTML = `<p class="bp-error">Could not load services. <a href="${SQUARE_BASE}" target="_blank" rel="noopener">Open booking site instead &rarr;</a></p>`;
        console.error("services-data load failed", err);
      });
    return dataLoadPromise;
  };

  const showBookScreen = (serviceId, serviceName) => {
    screenMenu.hidden = true;
    screenBook.hidden = false;
    backBtn.hidden = false;
    panel.querySelector(".book-panel__eyebrow").textContent = serviceName || "Book Now";
    screenBook.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `${SQUARE_BASE}/services/${encodeURIComponent(serviceId)}`;
    iframe.title = `Book ${serviceName || "appointment"}`;
    iframe.allow = "payment";
    screenBook.appendChild(iframe);
  };

  const showMenuScreen = () => {
    screenMenu.hidden = false;
    screenBook.hidden = true;
    backBtn.hidden = true;
    screenBook.innerHTML = "";
    panel.querySelector(".book-panel__eyebrow").textContent = "Book Now";
  };

  const open = () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("book-panel-open");
    if (!dataLoaded) loadData();
    requestAnimationFrame(updateTabsOverflow);
  };

  const close = () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("book-panel-open");
  };

  panel.addEventListener("click", (e) => {
    if (e.target.closest("[data-book-close]")) {
      close();
      return;
    }
    if (e.target.closest(".book-panel__back")) {
      showMenuScreen();
      return;
    }
    const tab = e.target.closest(".bp-tab");
    if (tab) {
      setActiveCat(tab.dataset.catId);
      return;
    }
    const svc = e.target.closest(".bp-svc");
    if (svc) {
      showBookScreen(svc.dataset.svcId, svc.dataset.svcName);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !panel.classList.contains("open")) return;
    if (!screenBook.hidden) showMenuScreen();
    else close();
  });

  // Intercept all booking links
  const isBookingLink = (a) => {
    const href = a.getAttribute("href") || "";
    return href === "booking.html" || href.startsWith("booking.html#");
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !isBookingLink(a)) return;
    e.preventDefault();
    const svcId = a.dataset.svcId;
    const svcName = a.dataset.svcName || a.querySelector(".svc__name")?.textContent.trim();
    if (svcId) {
      open();
      showBookScreen(svcId, svcName || "Book Now");
    } else {
      open();
    }
  });
})();
