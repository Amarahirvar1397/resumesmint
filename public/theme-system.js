// Simple theme toggle system
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-mode');
  
  if (isDark) {
    body.classList.remove('dark-mode');
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  
  // Update button icon
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
}

// Apply saved theme on page load
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
  }
  
  // Update button icon
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  applySavedTheme();
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
});

// Apply theme immediately to prevent flash
applySavedTheme();
