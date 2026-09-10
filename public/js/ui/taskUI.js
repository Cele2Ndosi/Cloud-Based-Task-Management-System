/**
 * Task UI Module
 *
 * Responsibility (single):
 * - Render task data, loading state, and error state into the DOM.
 * - Never import from services/taskService.js — this file receives
 *   plain data and callback functions, and has no idea Firestore
 *   exists.
 */

const elements = {
    list: document.querySelector("#task-list"),
    count: document.querySelector("#task-count"),
    emptyMessage: document.querySelector("#empty-message"),
    statusBanner: document.querySelector("#status-banner"),
    submitButton: document.querySelector("#submit-button"),
    input: document.querySelector("#task-input")
};

/**
 * Renders the full task list.
 *
 * @param {Array<{id: string, title: string, completed: boolean}>} tasks
 * @param {(taskId: string, completed: boolean) => void} onToggle
 * @param {(taskId: string) => void} onDelete
 * @returns {void}
 */
function renderTasks(tasks, onToggle, onDelete) {
    elements.list.replaceChildren();

    tasks.forEach((task) => {
        elements.list.appendChild(
            createTaskElement(task, onToggle, onDelete)
        );
    });

    elements.count.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

    elements.emptyMessage.classList.toggle("hidden", tasks.length > 0);
}

/**
 * @param {Object} task
 * @param {(taskId: string, completed: boolean) => void} onToggle
 * @param {(taskId: string) => void} onDelete
 * @returns {HTMLLIElement}
 */
function createTaskElement(task, onToggle, onDelete) {
    const listItem = document.createElement("li");
    listItem.className = "task-item";
    if (task.completed) {
        listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as complete`);
    checkbox.addEventListener("change", () => {
        onToggle(task.id, checkbox.checked);
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => onDelete(task.id));

    listItem.append(checkbox, title, deleteButton);
    return listItem;
}

/**
 * Shows or hides a status banner (e.g. "Signing in...", "Offline").
 *
 * @param {string|null} message - Pass null to hide the banner.
 * @param {"info"|"error"} [level]
 * @returns {void}
 */
function setStatusBanner(message, level = "info") {
    if (!message) {
        elements.statusBanner.classList.add("hidden");
        return;
    }

    elements.statusBanner.textContent = message;
    elements.statusBanner.className = `status-banner ${level}`;
}

/**
 * Disables the add-task form while a request is in flight, to prevent
 * duplicate submissions on slow connections.
 *
 * @param {boolean} isBusy
 * @returns {void}
 */
function setFormBusy(isBusy) {
    elements.submitButton.disabled = isBusy;
    elements.input.disabled = isBusy;
}

export { renderTasks, setStatusBanner, setFormBusy };