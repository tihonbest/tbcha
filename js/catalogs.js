/* Каталоги легко редактировать в data/*.json. Работают через HTTP/локальный сервер. */
async function getJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (error) {
    console.warn("Не удалось загрузить " + path + ". Запустите сайт через локальный сервер.", error);
    return null;
  }
}
function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function imageOrPlaceholder(path, alt, className) {
  const holder = element("div", className);
  if (path) {
    const img = element("img"); img.src = path; img.alt = alt || "";
    holder.append(img);
  } else holder.append(element("div", "placeholder", "ФОТО ДОБАВИТЬ ПОЗЖЕ"));
  return holder;
}
async function renderNews() {
  const root = document.querySelector("#news-list"); if (!root) return;
  const items = await getJSON("data/news.json"); if (!items) return;
  root.replaceChildren();
  items.forEach(item => {
    const row = element("article", "news-row reveal is-visible");
    row.append(element("div", "news-date", item.date || ""));
    const body = element("div");
    body.append(element("h2", "", item.title || ""), element("p", "", item.text || ""));
    if (item.image) { const img = element("img"); img.src = item.image; img.alt = item.title || ""; img.style.cssText = "max-width:100%;max-height:420px;object-fit:cover;margin-top:14px;border-radius:9px"; body.append(img); }
    row.append(body); root.append(row);
  });
}
async function renderMerch() {
  const root = document.querySelector("#merch-list"); if (!root) return;
  const items = await getJSON("data/merch.json"); if (!items) return;
  root.replaceChildren();
  items.forEach(item => {
    const card = element("article", "page-card reveal is-visible");
    card.append(imageOrPlaceholder(item.image, item.name, "work-image"), element("h3", "", item.name || ""), element("p", "", item.description || ""));
    if (item.price) card.append(element("p", "", item.price));
    root.append(card);
  });
}
async function renderTeachers() {
  const root = document.querySelector("#teachers-list"); if (!root) return;
  const items = await getJSON("data/teachers.json"); if (!items) return;
  root.replaceChildren();
  items.forEach(item => {
    const card = element("article", "page-card reveal is-visible");
    card.append(imageOrPlaceholder(item.image, item.name, "teacher-photo"), element("h3", "", item.name || ""), element("p", "", item.role || item.description || ""));
    root.append(card);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderNews(); renderMerch(); renderTeachers();
});