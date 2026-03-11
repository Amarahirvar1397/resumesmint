document.addEventListener("DOMContentLoaded", () => {
  // 📄 Template cards generate karna (5 templates)
  const container = document.getElementById("templateScroll");
  if (container) {
    for (let i = 1; i <= 5; i++) {
      const card = document.createElement("div");
      card.className = "template-card";

      const img = document.createElement("img");
      img.src = `assets/templates/template-${String(i).padStart(2, "0")}.png`;
      img.alt = `Template ${i}`;

      const title = document.createElement("h3");
      title.textContent = `Template ${i}`;

      const btn = document.createElement("button");
      btn.textContent = "Use Template";

      btn.addEventListener("click", () => {
        window.location.href = `fill.html?template=template-${String(i).padStart(2, "0")}`;
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(btn);

      container.appendChild(card);
    }
  }
});
