WTC-SL5HBBRL

# Cloud Task Manager

**Live demo: [https://cloud-based-task-managem-d80cd.web.app](https://cloud-based-task-managem-d80cd.web.app)**
No sign-in required — open the link and start adding tasks.

A simple to-do list app built to demonstrate core cloud-computing
concepts: a client talking to a managed cloud database, real-time data
sync, and server-enforced access control — using plain HTML/CSS/JS and
Google's Firebase platform (Cloud Firestore + Firebase Authentication +
Firebase Hosting).

No build tools, no framework, no sign-up required to use it.

## What it demonstrates

| Concept | Where it lives in this project |
|---|---|
| Cloud data storage | Cloud Firestore — tasks are stored remotely, not in the browser |
| Real-time sync | `onSnapshot()` in `taskService.js` — open the app in two tabs and watch changes appear in both instantly |
| Authentication without friction | Firebase Anonymous Auth — every visitor gets a private, working account automatically, with no login screen |
| Access control | `firestore.rules` — the database itself refuses to let one user read or write another user's tasks, independent of anything the client-side code does |
| Cloud hosting | Firebase Hosting serves the static files over HTTPS/CDN |

## How authentication works here

There is **no login screen**. When the app loads, it silently signs the
visitor in as an anonymous Firebase user in the background
(`ensureSignedIn()` in `auth.js`). That anonymous user gets a unique ID
(`uid`), and every task they create is stored under that `uid`. This
means:

- Anyone can open the app and start using it immediately — ideal for
  demoing or grading without needing an account.
- Each visitor's tasks are private to their own browser session — the
  Firestore rules enforce this server-side, not just in the UI.
- Clearing browser data or opening the app in a different browser
  starts a fresh, empty anonymous session — there is intentionally no
  "sign up to save your tasks across devices" step in this version, to
  keep the demo frictionless.

## Data model

```text
users/{uid}/tasks/{taskId}
    title: string        (1–200 characters)
    completed: boolean
    createdAt: timestamp  (server-assigned)
```

Each anonymous `uid` owns its own `tasks` subcollection. `firestore.rules`
enforces that a request can only read or write documents under its own
`uid` — this is checked on Firestore's servers, so it holds even if the
client-side app is bypassed entirely.

## Architecture / separation of concerns

```text
Browser
  │
  ▼
app.js  ───────────────►  taskUI.js       (renders tasks, no Firestore knowledge)
  │
  ▼
taskService.js  ─────────► auth.js         (who is signed in, the current uid)
  │
  ▼
Cloud Firestore:  users/{uid}/tasks/{taskId}
  │
  ▼
firestore.rules:  only the owning uid may read/write its own tasks
```

| File | Responsibility |
|---|---|
| `public/index.html` | Page structure only |
| `public/css/styles.css` | Presentation/styling only |
| `public/js/firebase.js` | Initializes the Firebase app, Firestore, and Auth service instances |
| `public/js/auth.js` | Ensures a signed-in user exists; exposes the current uid |
| `public/js/services/taskService.js` | All Firestore reads/writes for tasks — the only file that imports Firestore |
| `public/js/ui/taskUI.js` | Renders task data, loading state, and error banners into the DOM — no Firestore knowledge |
| `public/js/utils/validation.js` | Client-side task title validation (UX only — mirrored server-side in `firestore.rules`) |
| `public/js/app.js` | Orchestrates the above: wires DOM events to service calls |
| `firestore.rules` | Server-enforced access control for the database |
| `firebase.json` / `.firebaserc` | Firebase Hosting + rules deployment configuration |

## Running it locally

The live demo above requires no setup. If you want to run the code
locally instead (e.g. to read or modify it):

1. Install [Node.js](https://nodejs.org/) if you don't already have it
   (needed for the Firebase CLI and a local static server — the app
   itself needs no build step).
2. From the project root, serve the `public/` folder over HTTP (opening
   `index.html` directly via `file://` will not work — ES module imports
   require a real server):
   ```bash
   npx serve public
   ```
3. Open the printed local address (e.g. `http://localhost:3000`) in a
   browser.
4. That's it — no sign-in, no setup. Add, complete, and delete tasks;
   refresh the page to confirm they persist; open a second tab to the
   same address to see real-time sync in action.

## Firebase project configuration

This project is already wired up to a live Firebase project (see
`public/js/firebase.js` for the config and `.firebaserc` for the project
ID). To point it at a different Firebase project instead:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Anonymous**.
3. Enable **Firestore Database**, in production mode.
4. Register a Web app under Project Settings and copy the resulting
   config object into `public/js/firebase.js`.
5. Update the project ID in `.firebaserc`.
6. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

## Deploying

```bash
firebase deploy
```

This deploys both the static site (Firebase Hosting) and the security
rules (`firestore.rules`), as configured in `firebase.json`.

## Notes on the Firebase imports

This project has no bundler (no Webpack/Vite/etc.), so every Firebase
import in the JS files points directly at Firebase's CDN
(`https://www.gstatic.com/firebasejs/<version>/firebase-<service>.js`)
rather than at the npm package name. `npm install firebase` is still run
(see `package.json`) to provide the Firebase CLI (`firebase deploy`,
`firebase login`) used for deployment — the browser itself loads the SDK
straight from the CDN URLs in `firebase.js`, `auth.js`, and
`taskService.js`.

## Offline support

Firestore's local persistence cache is enabled in `firebase.js`
(`persistentLocalCache()`), so the app remains usable offline — changes
made without a connection sync automatically once connectivity returns.