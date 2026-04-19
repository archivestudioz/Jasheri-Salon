// Jasheri House of Beauty — main.js

// Mobile nav toggle
const toggle = document.querySelector(".nav__toggle");
const menus = document.querySelectorAll(".nav__menu");
if (toggle && menus.length) {
  const closeMenu = () => {
    toggle.classList.remove("open");
    menus.forEach((m) => m.classList.remove("open"));
  };
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    menus.forEach((m) => m.classList.toggle("open"));
  });
  document
    .querySelectorAll(".nav__menu a")
    .forEach((a) => a.addEventListener("click", closeMenu));
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
