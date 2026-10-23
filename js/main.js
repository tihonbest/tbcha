document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navlinks a").forEach(a => {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });

  // Reveal sections/cards as they enter the viewport.
  const revealNodes = document.querySelectorAll("section, .work-card, .page-card, .about-image, .hero-image");
  revealNodes.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach(el => io.observe(el));
  } else revealNodes.forEach(el => el.classList.add("is-visible"));

  // Thin page progress indicator.
  const progress = document.querySelector(".scroll-progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();
});