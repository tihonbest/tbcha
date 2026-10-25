
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

/* МЕРЧ */

async function renderMerch() {
  const root = document.querySelector("#merch-list");

  if (!root) return;

  const items = await getJSON("data/merch.json");

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
          "work-image",
          FALLBACK_IMAGES.merch
        ),
        element("h3", "", item.name || ""),
        element("p", "", item.description || "")
      );

      if (item.price) {
        card.append(element("p", "", item.price));
      }

      root.append(card);
    });
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
