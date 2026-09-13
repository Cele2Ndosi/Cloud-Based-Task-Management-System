/**
 * Task Service
 *
 * Responsibility (single):
 * - All Firestore reads/writes for tasks, scoped to the signed-in user.
 * - Nothing here touches the DOM. If you find yourself wanting to
 *   reference `document.querySelector` in this file, that logic belongs
 *   in ui/taskUI.js instead.
 *
 * Data model: users/{uid}/tasks/{taskId}
 * This subcollection path is why every function here needs the uid —
 * it's not optional context, it's part of the document path.
 */

import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { db } from "../firebase.js";

/**
 * Builds a reference to a given user's tasks subcollection.
 *
 * @param {string} userId
 * @returns {import("firebase/firestore").CollectionReference}
 */
function tasksCollectionFor(userId) {
    return collection(db, "users", userId, "tasks");
}

/**
 * Subscribes to real-time updates for a user's tasks, ordered newest
 * first.
 *
 * Using onSnapshot() instead of a one-time getDocs() means:
 * - The UI updates automatically after any write (no manual reload).
 * - Firestore's local cache resolves the serverTimestamp() ordering
 *   correctly for pending writes, avoiding the "new task jumps around"
 *   bug that a getDocs()-right-after-addDoc() pattern can hit.
 *
 * @param {string} userId
 * @param {(tasks: Array<Object>) => void} onTasksChanged - Called with
 *   the full, current task list every time it changes.
 * @param {(error: Error) => void} onError - Called if the subscription
 *   fails (e.g. rules deny access, or the client is offline and has no
 *   cached data).
 * @returns {() => void} Unsubscribe function — call it when the
 *   listener is no longer needed (e.g. on sign-out).
 */
function subscribeToTasks(userId, onTasksChanged, onError) {
    const tasksQuery = query(
        tasksCollectionFor(userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        tasksQuery,
        (snapshot) => {
            const tasks = snapshot.docs.map((document) => ({
                id: document.id,
                ...document.data()
            }));

            onTasksChanged(tasks);
        },
        onError
    );
}

/**
 * Creates a new task for the given user.
 *
 * Note: we intentionally do NOT re-fetch or return the new task list
 * here. The onSnapshot() listener from subscribeToTasks() will pick up
 * this change automatically and call onTasksChanged again.
 *
 * @param {string} userId
 * @param {string} title - Already validated/normalized by the caller.
 * @returns {Promise<void>}
 */
async function createTask(userId, title) {
    await addDoc(
        tasksCollectionFor(userId),
        {
            title,
            completed: false,
            createdAt: serverTimestamp()
        }
    );
}

/**
 * Updates a task's completion state.
 *
 * @param {string} userId
 * @param {string} taskId
 * @param {boolean} completed
 * @returns {Promise<void>}
 */
async function updateTaskCompletion(userId, taskId, completed) {
    const taskReference = doc(db, "users", userId, "tasks", taskId);

    await updateDoc(taskReference, { completed });
}

/**
 * Deletes a task.
 *
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function deleteTask(userId, taskId) {
    const taskReference = doc(db, "users", userId, "tasks", taskId);

    await deleteDoc(taskReference);
}

export {
    subscribeToTasks,
    createTask,
    updateTaskCompletion,
    deleteTask
};