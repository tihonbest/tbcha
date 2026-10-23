/* Каталоги ТБШ. Если своего фото нет, показываем тематическое изображение из интернета. */

const FALLBACK_IMAGES = {
  merch: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
  teachers: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85",
  worksBefore: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85",
  worksAfter: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1000&q=85"
};

async function getJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (error) {
    console.warn("Не удалось загрузить " + path + ". Проверьте путь к файлу и запустите сайт через HTTP-сервер.", error);
    return null;
  }
}

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/* Если пользовательское фото пустое или не загрузилось, подставляем тематическое. */
function imageOrFallback(path, alt, className, fallbackPath) {
  const holder = element("div", className);
  const img = element("img");
  img.alt = alt || "Временное изображение проекта ТБШ";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = path && path.trim() ? path : fallbackPath;

  img.onerror = function () {
    /* Не допускаем бесконечного цикла, если не загрузилась и запасная картинка. */
    if (img.dataset.fallbackUsed === "true") {
      img.onerror = null;
      holder.replaceChildren(element("div", "placeholder", "ИЗОБРАЖЕНИЕ ВРЕМЕННО НЕДОСТУПНО"));
      return;
    }
    img.dataset.fallbackUsed = "true";
    img.src = fallbackPath;
  };

  holder.append(img);
  return holder;
}

async function renderNews() {
  const root = document.querySelector("#news-list");
  if (!root) return;

  const items = await getJSON("data/news.json");
  if (!items) return;

  root.replaceChildren();
  items.forEach(item => {
    const row = element("article", "news-row reveal is-visible");
    row.append(element("div", "news-date", item.date || ""));

    const body = element("div");
    body.append(
      element("h2", "", item.title || ""),
      element("p", "", item.text || "")
    );

    if (item.image) {
      const img = element("img");
      img.src = item.image;
      img.alt = item.title || "";
      img.loading = "lazy";
      img.style.cssText = "max-width:100%;max-height:420px;object-fit:cover;margin-top:14px;border-radius:9px";
      body.append(img);
    }

    row.append(body);
    root.append(row);
  });
}

async function renderMerch() {
  const root = document.querySelector("#merch-list");
  if (!root) return;

  const items = await getJSON("data/merch.json");
  if (!items) return;

  root.replaceChildren();
  items.forEach(item => {
    const card = element("article", "page-card reveal is-visible");
    card.append(
      imageOrFallback(item.image, item.name, "work-image", FALLBACK_IMAGES.merch),
      element("h3", "", item.name || ""),
      element("p", "", item.description || "")
    );

    if (item.price) card.append(element("p", "", item.price));
    root.append(card);
  });
}

async function renderTeachers() {
  const root = document.querySelector("#teachers-list");
  if (!root) return;

  const items = await getJSON("data/teachers.json");
  if (!items) return;

  root.replaceChildren();
  items.forEach(item => {
    const card = element("article", "page-card reveal is-visible");
    card.append(
      imageOrFallback(item.image, item.name ? "Временное изображение для раздела: " + item.name : "Временное изображение наставников проекта", "teacher-photo", FALLBACK_IMAGES.teachers),
      element("h3", "", item.name || ""),
      element("p", "", item.role || item.description || "")
    );
    root.append(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNews();
  renderMerch();
  renderTeachers();
});
