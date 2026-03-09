// FAQ toggle
function toggleFaq(btn) {
  const item = btn.closest(".faq-item");
  const isOpen = item.classList.contains("open");
  document
    .querySelectorAll(".faq-item")
    .forEach((i) => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((el) => observer.observe(el));

// Nav shrink on scroll
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  nav.style.padding = window.scrollY > 60 ? "0.9rem 3rem" : "1.25rem 3rem";
});

// ─── HERO CV SLIDESHOW ───
(function () {
  const slides = document.querySelectorAll(".cv-slide");
  const dots = document.querySelectorAll(".cv-dot");
  const wrapper = document.querySelector(".cv-slideshow");
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, 3200);
  }

  // Click on slide → go to model page
  wrapper.addEventListener("click", () => {
    const href = slides[current].dataset.href;
    if (href) location.href = href;
  });

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goTo(i);
      startAuto();
    });
  });

  startAuto();
})();
