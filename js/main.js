// Jasheri House of Beauty — main.js

// Mobile nav toggle
const toggle = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    menu.classList.toggle("open");
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.classList.remove("open");
      menu.classList.remove("open");
    })
  );
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
