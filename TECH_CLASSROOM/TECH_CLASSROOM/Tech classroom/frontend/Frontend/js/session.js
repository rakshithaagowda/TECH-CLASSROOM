async function checkSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
    const data = await res.json();
    updateUIFromSession(data);
  } catch (err) {
    console.log("Session check failed", err);
  }
}

function updateUIFromSession(data) {
  const loginBtn = document.getElementById("loginNav");
  const signupLinks = document.querySelectorAll("a[href='pages/signup.html'], a[href='../pages/signup.html']");
  const cta = document.querySelector(".cta");
  const logoutBtn = document.getElementById("logoutBtn");

  let greet = document.getElementById("username-greet");
  if (!greet) {
    greet = document.createElement("span");
    greet.id = "username-greet";
    greet.style.marginLeft = "10px";
    document.querySelector(".navbar .nav-links").appendChild(greet);
  }

  if (data && data.logged_in) {
    if (loginBtn) loginBtn.style.display = "none";
    signupLinks.forEach(e => e.style.display = "none");
    if (cta) cta.style.display = "none";

    greet.textContent = `Hi, ${data.user.username}`;
    greet.style.display = "inline-block";

    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "";
    signupLinks.forEach(e => e.style.display = "");
    if (cta) cta.style.display = "";

    greet.textContent = "";
    greet.style.display = "none";

    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", checkSession);
