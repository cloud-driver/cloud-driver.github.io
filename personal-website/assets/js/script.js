document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("darkModeToggle");
  const icon = document.getElementById("darkModeIcon");

  // 根據儲存值切換主題與圖示
  const isDark = localStorage.getItem("dark-mode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    if (icon) icon.textContent = "☀️";
  }

  // 點擊切換主題
  toggleBtn?.addEventListener("click", () => {
    const enableDark = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", enableDark);
    localStorage.setItem("dark-mode", enableDark);
    if (icon) icon.textContent = enableDark ? "☀️" : "🌙";
  });
});
