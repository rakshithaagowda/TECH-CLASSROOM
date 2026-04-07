// quiz.js (Option B - points + unlock)
document.addEventListener("DOMContentLoaded", () => {
  let selectedSubject = null;
  let selectedLevel = null;

  const subjectCards = document.querySelectorAll(".subject-card");
  const levelCards = document.querySelectorAll(".level-card");
  const levelSelection = document.getElementById("level-selection");
  const subjectSelection = document.getElementById("subject-selection");
  const startBtn = document.getElementById("start-quiz-btn");
  const quizContainer = document.getElementById("quiz-container");

  let currentIndex = 0;
  let score = 0;
  let questions = [];
  let progress = {};

  // Subject selection
  subjectCards.forEach(card => {
    card.addEventListener("click", async () => {
      selectedSubject = card.dataset.subject;
      subjectSelection.style.display = "none";
      levelSelection.style.display = "block";
      await loadProgressAndRenderLevels();
    });
  });

  // Load progress and render level cards
  async function loadProgressAndRenderLevels() {
    try {
      const res = await fetch(`${API_BASE_URL}/quiz/progress`, {
        method: "GET",
        credentials: "include"
      });
      const body = await res.json();
      progress = body.progress || {};
    } catch (err) {
      progress = {};
    }

    const unlocked = progress[selectedSubject] || 1;
    applyUnlockUI(unlocked);
    selectedLevel = null;
    startBtn.style.display = "none";
  }

  function applyUnlockUI(unlockedLevel) {
    levelCards.forEach(card => {
      const lvl = parseInt(card.dataset.level, 10);

      if (lvl <= unlockedLevel) {
        card.classList.remove("locked");
        card.classList.add("unlocked");
        card.innerHTML = `Level ${lvl}`;
        card.style.pointerEvents = "auto";
        card.style.opacity = "1";
      } else {
        card.classList.remove("unlocked");
        card.classList.add("locked");
        card.innerHTML = `Level ${lvl} 🔒`;
        card.style.pointerEvents = "none";
        card.style.opacity = "0.5";
      }
    });
  }

  // level click
  levelCards.forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("locked")) {
        alert("This level is locked!");
        return;
      }
      selectedLevel = card.dataset.level;
      startBtn.style.display = "block";
    });
  });

  // start quiz
  startBtn.addEventListener("click", async () => {
    if (!selectedSubject || !selectedLevel) {
      alert("Select a subject and level first");
      return;
    }

    const url = `${API_BASE_URL}/quiz/${selectedSubject}/${selectedLevel}`;
    console.log("Fetching:", url);

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      alert("No questions found for this selection.");
      return;
    }

    // Normalize question shape to {question, options[], answer}
    questions = data.map(q => {
      if (Array.isArray(q.options)) {
        return { question: q.question || "", options: q.options, answer: q.answer };
      }
      return {
        question: q.question || "",
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
        answer: q.answer
      };
    });

    levelSelection.style.display = "none";
    quizContainer.style.display = "block";

    currentIndex = 0;
    score = 0;

    loadQuestion();
  });

  function loadQuestion() {
    if (currentIndex >= questions.length) {
      finishQuiz();
      return;
    }

    const q = questions[currentIndex];
    // render question and options
    quizContainer.innerHTML = `
      <h2>${q.question}</h2>
      <div class="options">
        ${q.options.map((opt, i) => `<button class="opt" data-index="${i}">${opt}</button>`).join("")}
      </div>
    `;

    document.querySelectorAll(".opt").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen = btn.textContent;
        if (chosen === q.answer) score++;
        currentIndex++;
        loadQuestion();
      });
    });
  }

  // finish quiz: save score, unlock next level
  async function finishQuiz() {
    const total = questions.length;
    quizContainer.innerHTML = `
      <h2>Quiz Completed!</h2>
      <p>Your Score: ${score} / ${total}</p>
    `;

    // Save the score to backend
    try {
      await fetch(`${API_BASE_URL}/quiz/score`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          level: parseInt(selectedLevel, 10),
          score: score,
          total: total
        })
      });
    } catch (err) {
      console.error("Failed to save score:", err);
    }

    // Unlock the next level (backend will ignore if invalid)
    const nextLevel = parseInt(selectedLevel, 10) + 1;
    try {
      const res = await fetch(`${API_BASE_URL}/quiz/progress`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedSubject, level: nextLevel })
      });
      const body = await res.json();
      console.log("Unlock response:", body);
      // update UI using returned max_level_unlocked if present
      if (body.max_level_unlocked) {
        progress[selectedSubject] = body.max_level_unlocked;
        applyUnlockUI(body.max_level_unlocked);
      } else {
        // fallback: re-fetch progress
        await loadProgressAndRenderLevels();
      }
    } catch (err) {
      console.error("Unlock request failed:", err);
    }
  }
});
