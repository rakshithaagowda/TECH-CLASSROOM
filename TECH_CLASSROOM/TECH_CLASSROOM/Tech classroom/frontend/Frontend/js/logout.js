document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        alert("❌ Logout failed");
        return;
      }

      alert("Logged out successfully!");

      if (typeof updateUIFromSession === "function") {
        updateUIFromSession({ logged_in: false });
      }

      window.location.href = "../index.html";
    } catch (err) {
      alert("⚠ Server error while logging out!");
    }
  });
});
