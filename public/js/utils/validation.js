/**
 * Validation Utilities
 *
 * Responsibility (single):
 * - Client-side validation for instant user feedback.
 *
 * Important: this is a UX convenience, not a security boundary. The
 * real enforcement of "title must be 1-200 characters" lives in
 * firestore.rules (Iteration 4), because this file's checks can be
 * bypassed by anyone calling the Firestore API directly. Keep these
 * two in sync if you ever change the limit.
 */

const MAX_TASK_LENGTH = 200;

/**
 * @param {string} title
 * @returns {boolean}
 */
function isValidTaskTitle(title) {
    const normalized = title.trim();
    return normalized.length > 0 && normalized.length <= MAX_TASK_LENGTH;
}

/**
 * @param {string} title
 * @returns {string}
 */
function normalizeTaskTitle(title) {
    return title.trim();
}

export { isValidTaskTitle, normalizeTaskTitle, MAX_TASK_LENGTH };