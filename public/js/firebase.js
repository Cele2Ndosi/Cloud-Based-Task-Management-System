/**
 * Firebase Configuration
 *
 * Responsibility (single):
 * - Initialize the Firebase app.
 * - Construct and export the service instances (Firestore, Auth) that
 *   the rest of the application will use.
 *
 * No application logic, no DOM access, and no task-related code
 * belongs in this file. If you're tempted to add a function here that
 * does something other than "set up a Firebase service," it belongs in
 * services/taskService.js or auth.js instead.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

/**
 * Firebase project configuration.
 * Safe to expose client-side — this is not a secret. Real access
 * control lives in firestore.rules.
 */
const firebaseConfig = {
    apiKey: "AIzaSyB5hixnCIUKvEnsTiYib_CtRNHvSzj58wI",
    authDomain: "cloud-based-task-managem-d80cd.firebaseapp.com",
    projectId: "cloud-based-task-managem-d80cd",
    storageBucket: "cloud-based-task-managem-d80cd.firebasestorage.app",
    messagingSenderId: "1069485430186",
    appId: "1:1069485430186:web:29dc43933b3196827107d3"
};

/** The initialized Firebase app instance. */
const app = initializeApp(firebaseConfig);

/** Cloud Firestore database instance, used only by taskService.js. */
const db = getFirestore(app);

/** Firebase Auth instance, used only by auth.js. */
const auth = getAuth(app);

export { db, auth };