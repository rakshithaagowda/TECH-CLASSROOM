// Redirect user to login page if not authenticated
async function ensureAuthenticated() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/me", {
      credentials: "include"
    });
  
    const data = await res.json();
  
    if (!data.logged_in) {
      alert("Please login first!");
      window.location.href = "login.html"; // auto redirect
    }
  } catch (err) {
    console.error("Auth check failed", err);
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", ensureAuthenticated);
