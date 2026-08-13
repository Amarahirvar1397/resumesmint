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
  
  // Load application count on dashboard
  const applicationCount = document.getElementById("application-count");
  if (applicationCount) {
    loadApplicationCount();
  }
});

async function loadApplicationCount() {
  try {
    const response = await fetch('/api/applications/count');
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('application-count').textContent = data.count;
    } else {
      document.getElementById('application-count').textContent = '0';
    }
  } catch (error) {
    console.error('Error loading application count:', error);
    document.getElementById('application-count').textContent = '0';
  }
}
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/login.html";
      } else {
        alert(data.message || "Logout failed");
      }

    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
    }
  });
}