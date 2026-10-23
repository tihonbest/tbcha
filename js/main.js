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


  // Header gently responds to scroll position.
  const header = document.querySelector(".site-header");
  const updateHeader = () => { if (header) header.classList.toggle("is-scrolled", window.scrollY > 12); };
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Scroll-linked story: change the shirt artwork and copy as the user moves through the scene.
  const story = document.querySelector(".story-scroll");
  if (story) {
    const art = document.querySelector("#story-art");
    const kicker = document.querySelector("#story-kicker");
    const title = document.querySelector("#story-title");
    const description = document.querySelector("#story-description");
    const count = document.querySelector("#story-count");
    const fill = document.querySelector("#story-progress-fill");
    const stages = [
      { kicker: "01 / НАЧАЛО", title: "У неё уже<br>есть история.", description: "Любимая вещь со временем теряет актуальность. Но это ещё не конец — это материал для новой идеи." },
      { kicker: "02 / ЭКСПЕРИМЕНТ", title: "Время придумать<br>что-то своё.", description: "Подбираем детали, пробуем формы и цвета. Именно здесь обычная одежда начинает меняться." },
      { kicker: "03 / НОВАЯ ЖИЗНЬ", title: "Та же вещь.<br>Другой характер.", description: "Немного смелости и творчества — и вещь становится уникальной. Меньше отходов, больше индивидуальности." }
    ];
    let activeStage = -1;
    const updateStory = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const stage = Math.min(2, Math.floor(progress * 3));
      if (stage !== activeStage) {
        activeStage = stage;
        const item = stages[stage];
        if (art) art.dataset.stage = String(stage);
        if (kicker) kicker.textContent = item.kicker;
        if (title) title.innerHTML = item.title;
        if (description) {
          description.style.opacity = "0";
          description.style.transform = "translateY(8px)";
          window.setTimeout(() => {
            description.innerHTML = item.description;
            description.style.opacity = "1";
            description.style.transform = "translateY(0)";
          }, 120);
        }
        if (count) count.textContent = String(stage + 1).padStart(2, "0");
      }
      if (fill) fill.style.width = `${Math.max(1, progress * 100)}%`;
    };
    window.addEventListener("scroll", updateStory, { passive: true });
    window.addEventListener("resize", updateStory);
    updateStory();
  }

  // Tiny pointer tilt on large screens only; no motion on touch devices.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".work-card, .page-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const r = card.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width - .5;
        const y = (event.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y * 2.5}deg) rotateY(${x * 2.5}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }
});
