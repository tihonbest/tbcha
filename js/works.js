document.addEventListener("DOMContentLoaded", () => {
  const range = document.querySelector("#ba-range");
  const after = document.querySelector("#ba-after");
  if (range && after) {
    const update = () => after.style.clipPath = `inset(0 ${100 - Number(range.value)}% 0 0)`;
    range.addEventListener("input", update);
    update();
  }
});