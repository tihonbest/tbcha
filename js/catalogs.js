
/* Динамические карточки сайта «Вещь с историей». */

const FALLBACK_IMAGES = {
  merch: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
  teachers: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
};

async function getJSON(path) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    return await response.json();
  } catch (error) {
    console.warn("Не удалось загрузить данные раздела:", error);
    return null;
  }
}

function element(tag, className, text) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  if (text !== undefined) {
    el.textContent = text;
  }

  return el;
}

function imageOrFallback(path, alt, className, fallbackPath) {
  const holder = element("div", className);
  const img = element("img");

  img.alt = alt || "Изображение проекта «Вещь с историей»";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = path && path.trim() ? path : fallbackPath;

  img.onerror = function () {
    if (img.dataset.fallbackUsed === "true") {
      img.onerror = null;
      img.remove();
      return;
    }

    img.dataset.fallbackUsed = "true";
    img.src = fallbackPath;
  };

  holder.append(img);

  return holder;
}

function renderEmptyState(root, title, description) {
  const row = element("article", "news-row reveal is-visible");
  const body = element("div");

  body.append(
    element("h2", "", title),
    element("p", "", description)
  );

  row.append(body);
  root.replaceChildren(row);
}

/* НОВОСТИ */

async function renderNews() {
  const root = document.querySelector("#news-list");

  if (!root) return;

  const items = await getJSON("data/news.json");

  if (!Array.isArray(items)) {
    renderEmptyState(
      root,
      "Не удалось загрузить новости",
      "Проверь файл data/news.json и попробуй обновить страницу."
    );
    return;
  }

  root.replaceChildren();

  // Показываем все новости, в том числе с demo: true.
  const visibleItems = items;

  if (visibleItems.length === 0) {
    renderEmptyState(
      root,
      "Новости мастерской",
      "Новые идеи, работы и события проекта появятся здесь."
    );
    return;
  }

  visibleItems.forEach(item => {
    const row = element("article", "news-row reveal is-visible");

    row.append(
      element("div", "news-date", item.date || "")
    );

    const body = element("div");

    body.append(
      element("h2", "", item.title || ""),
      element("p", "", item.text || "")
    );

    if (item.image) {
      const img = element("img");

      img.src = item.image;
      img.alt = item.title || "Новость проекта";
      img.loading = "lazy";
      img.decoding = "async";

      img.style.cssText =
        "max-width:100%;max-height:420px;object-fit:cover;margin-top:14px;border-radius:9px";

      img.onerror = () => {
        img.remove();
      };

      body.append(img);
    }

    row.append(body);
    root.append(row);
  });
}

/* МЕРЧ — фотографии определяются по именам N.jpg и N.1.jpg, N.2.jpg... */
async function getMerchGroups() {
  const endpoint = "https://api.github.com/repos/tihonbest/tbcha/git/trees/main?recursive=1";
  const response = await fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error("GitHub API: " + response.status);
  const data = await response.json();
  const files = (data.tree || []).filter(item =>
    item.type === "blob" && /^photo\/merch\/\d+(?:\.\d+)?\.jpe?g$/i.test(item.path)
  );
  const groups = new Map();
  files.forEach(file => {
    const name = file.path.split("/").pop();
    const match = name.match(/^(\d+)(?:\.(\d+))?\.jpe?g$/i);
    if (!match) return;
    const id = Number(match[1]);
    if (!groups.has(id)) groups.set(id, { id, original: null, views: [] });
    const group = groups.get(id);
    const url = "https://raw.githubusercontent.com/tihonbest/tbcha/main/" + file.path;
    if (match[2]) group.views.push({ order: Number(match[2]), url });
    else group.original = url;
  });
  return [...groups.values()]
    .filter(group => group.original && group.views.length)
    .map(group => ({ ...group, views: group.views.sort((a,b) => a.order - b.order).map(view => view.url) }))
    .sort((a,b) => a.id - b.id);
}

function makeMerchCard(item) {
  const card = element("article", "merch-card");
  const visual = element("div", "merch-visual");
  const track = element("div", "merch-track");
  const image = element("img");
  let index = 0;
  let showingOriginal = false;
  image.src = item.views[0];
  image.alt = "Обновлённая вещь № " + item.id;
  image.loading = "lazy";
  image.draggable = false;
  track.append(image);
  visual.append(track);

  const count = element("span", "merch-view-count", "01 / " + String(item.views.length).padStart(2,"0"));
  visual.append(count);

  const controls = element("div", "merch-dots");
  item.views.forEach((_, i) => {
    const dot = element("button", "merch-dot" + (i === 0 ? " is-active" : ""));
    dot.type = "button";
    dot.setAttribute("aria-label", "Показать ракурс " + (i + 1));
    dot.addEventListener("click", () => {
      if (showingOriginal) return;
      index = i;
      image.src = item.views[index];
      count.textContent = String(index + 1).padStart(2,"0") + " / " + String(item.views.length).padStart(2,"0");
      [...controls.children].forEach((node, n) => node.classList.toggle("is-active", n === index));
    });
    controls.append(dot);
  });
  if (item.views.length > 1) visual.append(controls);

  const info = element("div", "merch-card-info");
  const textBlock = element("div");
  textBlock.append(
    element("span", "merch-number", String(item.id).padStart(2,"0") + " / ПЕРЕРАБОТАНО"),
    element("h3", "", "Вещь № " + item.id),
    element("p", "", "Обновлённая вещь. История продолжается.")
  );
  const toggle = element("button", "merch-original", "Показать оригинал");
  toggle.type = "button";
  toggle.setAttribute("aria-pressed", "false");
  toggle.addEventListener("click", () => {
    showingOriginal = !showingOriginal;
    image.classList.add("is-changing");
    window.setTimeout(() => {
      image.src = showingOriginal ? item.original : item.views[index];
      image.alt = showingOriginal ? "Оригинальная вещь № " + item.id : "Обновлённая вещь № " + item.id;
      image.classList.remove("is-changing");
    }, 140);
    toggle.textContent = showingOriginal ? "Показать новую версию" : "Показать оригинал";
    toggle.setAttribute("aria-pressed", String(showingOriginal));
    controls.classList.toggle("is-muted", showingOriginal);
    count.textContent = showingOriginal ? "ОРИГИНАЛ" : String(index + 1).padStart(2,"0") + " / " + String(item.views.length).padStart(2,"0");
  });

  let touchStartX = 0;
  visual.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  visual.addEventListener("touchend", event => {
    if (showingOriginal || item.views.length < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 35) return;
    index = (index + (delta < 0 ? 1 : -1) + item.views.length) % item.views.length;
    image.src = item.views[index];
    count.textContent = String(index + 1).padStart(2,"0") + " / " + String(item.views.length).padStart(2,"0");
    [...controls.children].forEach((node, n) => node.classList.toggle("is-active", n === index));
  }, { passive: true });

  info.append(textBlock, toggle);
  card.append(visual, info);
  return card;
}

async function renderMerch() {
  const root = document.querySelector("#merch-list");
  if (!root) return;
  try {
    const groups = await getMerchGroups();
    if (!groups.length) return; // Оставляем аккуратные заглушки из HTML.
    root.replaceChildren(...groups.map(makeMerchCard));
  } catch (error) {
    console.warn("Не удалось загрузить каталог мерча:", error);
    // Если GitHub API временно недоступен, заглушки остаются на месте.
  }
}

/* УЧИТЕЛЯ */

async function renderTeachers() {
  const root = document.querySelector("#teachers-list");

  if (!root) return;

  const items = await getJSON("data/teachers.json");

  if (!Array.isArray(items)) return;

  root.replaceChildren();

  items
    .filter(item => !item.demo)
    .forEach(item => {
      const card = element("article", "page-card reveal is-visible");

      card.append(
        imageOrFallback(
          item.image,
          item.name,
          "teacher-photo",
          FALLBACK_IMAGES.teachers
        ),
        element("h3", "", item.name || ""),
        element("p", "", item.role || item.description || "")
      );

      root.append(card);
    });
}

/* ЗАПУСК */

document.addEventListener("DOMContentLoaded", () => {
  renderNews();
  renderMerch();
  renderTeachers();
});
