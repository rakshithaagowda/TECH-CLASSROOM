document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");

  if (!loginBtn || !loginForm) return;

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.status === 200) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      alert("Network error — is the backend running?");
    }
  });
});

