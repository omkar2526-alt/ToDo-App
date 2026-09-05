/**
 * TaskMaster - Interactive To-Do Application
 * Features:
 * - Add, Edit, Delete tasks
 * - Status toggle (Completed / Pending)
 * - Filtering: All, Pending, Completed
 * - Dark Mode with persistence
 * - LocalStorage state management
 */

// --- DOM Elements ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const todoForm = document.getElementById("todoForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");

const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const countAllEl = document.getElementById("countAll");
const countPendingEl = document.getElementById("countPending");
const countCompletedEl = document.getElementById("countCompleted");
const taskStatsEl = document.getElementById("taskStats");
const itemsLeftSummaryEl = document.getElementById("itemsLeftSummary");

// --- State ---
const STORAGE_KEY = "taskmaster_tasks";
const THEME_KEY = "taskmaster_theme";

let currentFilter = "all";
let editingTaskId = null;

// Initial tasks or load from localStorage
let tasks = [];

function loadTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            tasks = JSON.parse(stored);
        } else {
            // Default welcome tasks if first visit
            tasks = [
                { id: "task-1", text: "Welcome to TaskMaster! ✨", completed: false, createdAt: Date.now() },
                { id: "task-2", text: "Click the checkbox to mark a task as completed", completed: true, createdAt: Date.now() - 1000 },
                { id: "task-3", text: "Use the edit icon or double click to modify me", completed: false, createdAt: Date.now() - 2000 }
            ];
            saveTasks();
        }
    } catch (e) {
        console.error("Error accessing localStorage", e);
        tasks = [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Failed to save tasks", e);
    }
}

// --- Theme Management (Dark / Light) ---
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
    } else {
        // Respect system preference if no stored preference
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
            document.body.classList.add("dark-mode");
        }
    }
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

// --- Rendering Tasks ---
function render() {
    taskList.innerHTML = "";

    // Calculate Counts
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;

    countAllEl.textContent = totalCount;
    countPendingEl.textContent = pendingCount;
    countCompletedEl.textContent = completedCount;

    // Header & Footer summaries
    if (pendingCount === 0 && totalCount > 0) {
        taskStatsEl.textContent = "All tasks completed! Great job! 🎉";
    } else {
        taskStatsEl.textContent = `${pendingCount} task${pendingCount === 1 ? "" : "s"} pending`;
    }
    itemsLeftSummaryEl.textContent = `${pendingCount} item${pendingCount === 1 ? "" : "s"} remaining`;

    // Filter Tasks
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true; // 'all'
    });

    // Empty state handling
    if (filteredTasks.length === 0) {
        emptyState.classList.remove("hidden");
        const emptyDesc = emptyState.querySelector(".empty-desc");
        if (currentFilter === "completed") {
            emptyDesc.textContent = "No completed tasks yet. Keep moving forward!";
        } else if (currentFilter === "pending") {
            emptyDesc.textContent = "No pending tasks. You are all caught up!";
        } else {
            emptyDesc.textContent = "Add your first task above to get started!";
        }
    } else {
        emptyState.classList.add("hidden");
    }

    // Render list items
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;
        li.dataset.id = task.id;

        if (editingTaskId === task.id) {
            // Render inline edit form
            li.innerHTML = `
                <form class="edit-form-inline" onsubmit="return false;">
                    <input type="text" class="edit-input" value="${escapeHtml(task.text)}">
                    <button type="button" class="btn-save">Save</button>
                    <button type="button" class="btn-cancel">Cancel</button>
                </form>
            `;

            const editInput = li.querySelector(".edit-input");
            const saveBtn = li.querySelector(".btn-save");
            const cancelBtn = li.querySelector(".btn-cancel");

            setTimeout(() => {
                editInput.focus();
                editInput.select();
            }, 0);

            const handleSave = () => {
                const newText = editInput.value.trim();
                if (newText) {
                    task.text = newText;
                    saveTasks();
                }
                editingTaskId = null;
                render();
            };

            const handleCancel = () => {
                editingTaskId = null;
                render();
            };

            saveBtn.addEventListener("click", handleSave);
            cancelBtn.addEventListener("click", handleCancel);

            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                } else if (e.key === "Escape") {
                    handleCancel();
                }
            });
        } else {
            // Standard task item
            li.innerHTML = `
                <div class="task-left">
                    <label class="custom-checkbox" title="Mark as ${task.completed ? "pending" : "completed"}">
                        <input type="checkbox" ${task.completed ? "checked" : ""}>
                        <span class="checkmark">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </span>
                    </label>
                    <span class="task-content" title="Double click to edit">${escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon edit-btn" aria-label="Edit task" title="Edit task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon del-btn" aria-label="Delete task" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;

            // Checkbox event
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveTasks();
                render();
            });

            // Edit button event
            const editBtn = li.querySelector(".edit-btn");
            editBtn.addEventListener("click", () => {
                editingTaskId = task.id;
                render();
            });

            // Double-click to edit
            const contentEl = li.querySelector(".task-content");
            contentEl.addEventListener("dblclick", () => {
                editingTaskId = task.id;
                render();
            });

            // Delete button event with smooth exit animation
            const delBtn = li.querySelector(".del-btn");
            delBtn.addEventListener("click", () => {
                li.classList.add("removing");
                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    render();
                }, 200);
            });
        }

        taskList.appendChild(li);
    });
}

// Helper: Escape HTML to avoid XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// --- Add Task Handler ---
function handleAddTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: "task-" + Date.now(),
        text: text,
        completed: false,
        createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();
    taskInput.value = "";
    taskInput.focus();

    // If filter is currently 'completed', switch to 'all' so new item is visible
    if (currentFilter === "completed") {
        setFilter("all");
    } else {
        render();
    }
}

// Event Listeners for Add
addBtn.addEventListener("click", handleAddTask);
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAddTask();
});

// --- Filter Buttons ---
function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
    });
    render();
}

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        setFilter(btn.dataset.filter);
    });
});

// --- Clear Completed ---
clearCompletedBtn.addEventListener("click", () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    // Optional subtle confirm or immediate clear
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
});

// --- Initialize App ---
initTheme();
loadTasks();
render();
