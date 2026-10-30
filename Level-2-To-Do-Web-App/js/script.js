const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompleted = document.getElementById("clearCompleted");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";
let editingId = null;

document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, text, editButton, deleteButton);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} tasks remaining`;

  emptyState.style.display = filteredTasks.length === 0 ? "block" : "none";
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  if (editingId !== null) {
    const task = tasks.find((task) => task.id === editingId);
    if (task) task.text = text;
    editingId = null;
    document.getElementById("submitBtn").textContent = "+ Add Task";
  } else {
    tasks.push({
      id: Date.now(),
      text: text,
      completed: false,
    });
  }

  taskInput.value = "";
  saveTasks();
  renderTasks();
});

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  taskInput.value = task.text;
  editingId = id;
  document.getElementById("submitBtn").textContent = "Update Task";
  taskInput.focus();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  if (editingId === id) {
    editingId = null;
    taskInput.value = "";
    document.getElementById("submitBtn").textContent = "+ Add Task";
  }

  saveTasks();
  renderTasks();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  editingId = null;
  taskInput.value = "";
  document.getElementById("submitBtn").textContent = "+ Add Task";

  saveTasks();
  renderTasks();
});

renderTasks();
