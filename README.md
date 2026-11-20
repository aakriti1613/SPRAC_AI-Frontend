# Platform frontend (React + Vite)

The web app for the scaffolder: login, template gallery, portal wizard, and the **AI builder**.

```bash
npm install
npm run dev        # http://localhost:5173  (needs the backend, see VITE_API_BASE)
npm run lint
npm run build
```

## AI builder (`/builder`, "Build with AI" on the gallery)

Describe a site -> review and edit the plan -> build -> push -> deploy.

| File | What it does |
|---|---|
| `src/builder/Builder.jsx` | the page; holds the state and talks to the backend |
| `src/builder/StepDescribe.jsx` | screen 1: description + style choice |
| `src/builder/StepPlan.jsx` | screen 2: what was planned; edit name, type, industry, style, rooms, modules; see the components used |
| `src/builder/StepResult.jsx` | screen 3: build, checks, reuse numbers, push to GitHub, deploy |
| `src/builder/builderState.js` | the user's choices and every edit, as plain pure functions |
| `src/builder/builderClient.js` | the API calls (fetch is passed in, so it is testable) |

The screen never invents a config: every edit is sent to the server (`POST /api/sparc/config`), which rebuilds and validates it,
then `POST /api/compose` says which verified component fills each room. The builder's logic is tested from the backend's
test suite against the real server (`platform-backend-main/test/phase6.test.js`).

The backend must have `SPARC_API_ENABLED=1`; otherwise the builder shows how to turn it on.
