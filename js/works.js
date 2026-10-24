document.addEventListener("DOMContentLoaded", () => {
  const range = document.getElementById("ba-range");
  const after = document.getElementById("ba-after");
  const divider = document.getElementById("ba-divider");

  if (!range || !after || !divider) return;

  function updateComparison() {
    const value = Number(range.value);

    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    divider.style.left = `${value}%`;
  }

  range.addEventListener("input", updateComparison);
  updateComparison();
});
