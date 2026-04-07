document.addEventListener("DOMContentLoaded", loadScores);

async function loadScores() {
  try {
    const res = await fetch(`${API_BASE_URL}/quiz/score/summary`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    const tbody = document.getElementById("subjectPerfBody");
    tbody.innerHTML = "";

    const scores = data.scores || {};

    // 1) Display total points
    document.getElementById("dashTotalPoints").textContent = data.total_points || 0;

    // 2) Fill subject rows
    const subjects = ["python", "ds", "java", "cn", "os"];

    subjects.forEach(sub => {
      const obj = scores[sub] || { earned: 0, total: 0 };
      const earned = obj.earned;
      const total = obj.total;
      const percent = total ? Math.round((earned / total) * 100) : 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:left">${sub.toUpperCase()}</td>
        <td>${earned} / ${total}</td>
        <td>${percent}%</td>
      `;
      tbody.appendChild(tr);
    });

    // 3) Calculate badges
    const badges = calculateBadges(scores);

    // 4) Update count
    document.getElementById("dashTotalBadges").textContent = badges.length;

    // 5) Show mini badge icons
    const badgeView = document.getElementById("badgePreview");
    badgeView.innerHTML = badges.map(b => b.icon).join("");

  } catch (err) {
    console.error("Could not load dashboard:", err);
  }
}

// BADGE CALCULATION LOGIC
function calculateBadges(scores) {
  let badges = [];

  let completedLevels = 0;

  for (let sub in scores) {
    const subject = scores[sub];
    let earned = subject.earned;
    let total = subject.total;

    if (total > 0) completedLevels++;

    const percent = total ? earned / total : 0;

    // Silver
    if (percent >= 0.50) {
      badges.push({ name: "Silver", icon: "🥈" });
    }

    // Gold
    if (percent >= 0.80) {
      badges.push({ name: "Gold", icon: "🥇" });
    }

    // Platinum (>=80% across entire subject)
    if (percent >= 0.80 && total >= 30) {
      badges.push({ name: "Platinum", icon: "🌟" });
    }
  }

  // Bronze (at least 1 quiz completed)
  if (completedLevels >= 1) {
    badges.push({ name: "Bronze", icon: "🥉" });
  }

  return badges;
}
