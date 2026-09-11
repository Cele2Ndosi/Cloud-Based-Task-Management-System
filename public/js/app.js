/**
 * Cloud Task Manager - Application Controller
 *
 * Responsibility (single):
 * - Wire together auth, the task service, and the UI layer.
 * - Own the "what happens when the user does X" logic.
 *
 * This file should stay thin: if a block of logic here starts doing
 * DOM manipulation, move it to ui/taskUI.js; if it starts building
 * Firestore queries, move it to services/taskService.js.
 */

import { ensureSignedIn, getCurrentUserId } from "./auth.js";

import {
    subscribeToTasks,
    createTask,
    updateTaskCompletion,
    deleteTask
} from "./services/taskService.js";

import { renderTasks, setStatusBanner, setFormBusy } from "./ui/taskUI.js";

import { isValidTaskTitle, normalizeTaskTitle } from "./utils/validation.js";

const elements = {
    form: document.querySelector("#task-form"),
    input: document.querySelector("#task-input")
};

/**
 * Handles the add-task form submission.
 *
 * @param {SubmitEvent} event
 * @returns {Promise<void>}
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const rawTitle = elements.input.value;

    if (!isValidTaskTitle(rawTitle)) {
        return;
    }

    const title = normalizeTaskTitle(rawTitle);

    // Disable the form for the duration of the request so a slow
    // connection can't produce duplicate tasks from repeated clicks.
    setFormBusy(true);

    try {
        await createTask(getCurrentUserId(), title);
        elements.form.reset();
        // No manual reload here — the onSnapshot listener set up in
        // initializeApplication() will re-render automatically.
    } catch (error) {
        console.error("Failed to create task:", error);
        setStatusBanner("Couldn't add that task. Please try again.", "error");
    } finally {
        setFormBusy(false);
        elements.input.focus();
    }
}

/**
 * @param {string} taskId
 * @param {boolean} completed
 * @returns {Promise<void>}
 */
async function handleTaskToggle(taskId, completed) {
    try {
        await updateTaskCompletion(getCurrentUserId(), taskId, completed);
    } catch (error) {
        console.error("Failed to update task:", error);
        setStatusBanner("Couldn't update that task. Please try again.", "error");
    }
}

/**
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function handleTaskDelete(taskId) {
    try {
        await deleteTask(getCurrentUserId(), taskId);
    } catch (error) {
        console.error("Failed to delete task:", error);
        setStatusBanner("Couldn't delete that task. Please try again.", "error");
    }
}

/**
 * Application entry point.
 * @returns {Promise<void>}
 */
async function initializeApplication() {
    elements.form.addEventListener("submit", handleFormSubmit);

    setStatusBanner("Signing in...");

    try {
        const user = await ensureSignedIn();

        setStatusBanner(null);

        // Subscribe once; every future create/update/delete anywhere
        // (this tab, another tab, another device) re-renders via this
        // single callback.
        subscribeToTasks(
            user.uid,
            (tasks) => renderTasks(tasks, handleTaskToggle, handleTaskDelete),
            (error) => {
                console.error("Task subscription failed:", error);
                setStatusBanner(
                    "Couldn't load your tasks. Check your connection.",
                    "error"
                );
            }
        );
    } catch (error) {
        console.error("Sign-in failed:", error);
        setStatusBanner("Couldn't connect. Please refresh the page.", "error");
    }
}

initializeApplication();