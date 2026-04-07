
// frontend/Frontend/js/signup.js
// Assumes config.js is loaded first (so API_BASE_URL exists)

document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signupBtn");
    const signupForm = document.getElementById("signupForm");

  if (!signupBtn || !signupForm) return;

  signupBtn.addEventListener("click", async () => {
    // collect values
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    // simple client-side validation
    if (!fullname || !email || !username || !password) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullname, email, username, password })
      });

      const data = await res.json();

      if (res.status === 201) {
        alert("Signup successful. Please login.");
        // redirect to login page served by Live Server
        window.location.href = "/login.html";
      } else {
        // show server error message
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup request failed", err);
      alert("Network error. Make sure backend is running and CORS is enabled.");
    }
  });
});

