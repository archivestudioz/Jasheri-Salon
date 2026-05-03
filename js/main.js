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

// Reveal-on-scroll
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
