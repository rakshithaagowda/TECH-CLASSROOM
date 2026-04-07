const API_BASE_URL = "http://localhost:5000/api";  // your backend
const USER_ID = 1; // temporary — replace with real logged user later

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskContainer = document.getElementById("taskContainer");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");

let tasks = [];

window.onload = () => {
  fetchTasks();
};

// ------------------------ FETCH ALL TASKS ------------------------
async function fetchTasks() {
  const res = await fetch(`${API_BASE_URL}/todo?user_id=${USER_ID}`);
  tasks = await res.json();
  renderTasks();
}

// ------------------------ ADD NEW TASK ------------------------
addTaskBtn.addEventListener("click", () => addTask());
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const res = await fetch(`${API_BASE_URL}/todo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID, text })
  });

  const data = await res.json();
  tasks.push({ id: data.id, text, completed: 0 });
  taskInput.value = "";

  renderTasks();
}

// ------------------------ TOGGLE COMPLETE ------------------------
async function toggleTask(taskId) {
  const res = await fetch(`${API_BASE_URL}/todo/${taskId}`, {
    method: "PUT"
  });

  const data = await res.json();

  tasks = tasks.map(t =>
    t.id === taskId ? { ...t, completed: data.completed } : t
  );

  renderTasks();
}

// ------------------------ DELETE TASK ------------------------
async function deleteTask(taskId) {
  await fetch(`${API_BASE_URL}/todo/${taskId}`, {
    method: "DELETE"
  });

  tasks = tasks.filter(t => t.id !== taskId);
  renderTasks();
}

// ------------------------ RENDER UI ------------------------
function renderTasks() {
  taskContainer.innerHTML = "";

  let completedCount = 0;

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "todo-card";
    if (task.completed) card.classList.add("completed");

    card.innerHTML = `
      <div class="task-left">
        <div class="complete-btn ${task.completed ? "completed" : ""}"></div>
        <p>${task.text}</p>
      </div>
      <i class="fa-solid fa-trash delete-btn"></i>
    `;

    // Event: toggle complete
    card.querySelector(".complete-btn").addEventListener("click", () => {
      toggleTask(task.id);
    });

    // Event: delete
    card.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task.id);
    });

    taskContainer.appendChild(card);

    if (task.completed) completedCount++;
  });

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completedCount;
}