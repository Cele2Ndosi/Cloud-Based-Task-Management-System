/**
 * Auth Module
 *
 * Responsibility (single):
 * - Ensure a user is signed in (anonymously, for now) before any
 *   Firestore operation runs.
 * - Expose the current user's uid to the rest of the app.
 * - Later (Iteration 9), this file is where we "upgrade" an anonymous
 *   account to a permanent one — no other file needs to change when
 *   that happens.
 *
 * No DOM access and no Firestore task queries belong here.
 */
import {
    EmailAuthProvider,
    linkWithCredential
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase.js";

/**
 * Resolves once a user (anonymous or upgraded) is signed in.
 * Call this once, at application startup, before touching Firestore.
 *
 * @returns {Promise<import("firebase/auth").User>}
 */
function ensureSignedIn() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe();

                if (user) {
                    resolve(user);
                    return;
                }

                // No session yet — create an anonymous one.
                signInAnonymously(auth)
                    .then((credential) => resolve(credential.user))
                    .catch(reject);
            },
            reject
        );
    });
}

/**
 * Returns the currently signed-in user's uid.
 * Throws if called before ensureSignedIn() has resolved — this is a
 * programmer error (wrong call order), not a runtime condition to
 * handle gracefully, so a thrown error is appropriate here.
 *
 * @returns {string}
 */
function getCurrentUserId() {
    if (!auth.currentUser) {
        throw new Error(
            "getCurrentUserId() called before sign-in completed. " +
            "Call ensureSignedIn() first."
        );
    }

    return auth.currentUser.uid;
}

/**
 * Upgrades the current anonymous session to a permanent
 * email/password account. The uid does not change, so all existing
 * tasks under users/{uid}/tasks remain accessible with no migration.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
async function upgradeToEmailAccount(email, password) {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(auth.currentUser, credential);
}

export { ensureSignedIn, getCurrentUserId, upgradeToEmailAccount };