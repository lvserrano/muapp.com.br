// nav shrink
const nav = document.getElementById("mainNav");
window.addEventListener("scroll", () => {
  nav.style.padding = window.scrollY > 60 ? "0.9rem 3rem" : "1.25rem 3rem";
});

// scroll reveal com stagger por coluna
const cards = document.querySelectorAll(".model-card");
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const idx = [...cards].indexOf(e.target);
        setTimeout(() => e.target.classList.add("visible"), (idx % 4) * 90);
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.06 },
);
cards.forEach((c) => obs.observe(c));

// filtros
const filterBtns = document.querySelectorAll(".filter-btn");
const countLabel = document.getElementById("countLabel");
const emptyState = document.getElementById("emptyState");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    let visible = 0;

    cards.forEach((card) => {
      const tags = card.dataset.tags || "";
      const show = filter === "all" || tags.includes(filter);
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    countLabel.textContent =
      filter === "all"
        ? "10 modelos"
        : visible === 1
          ? "1 modelo"
          : `${visible} modelos`;

    emptyState.classList.toggle("show", visible === 0);
  });
});
