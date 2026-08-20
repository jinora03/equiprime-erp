# Equiprime ERP — Web Demo

A standalone, self-contained copy of the Equiprime ERP frontend. It runs
entirely in the browser on mock data — **no backend or server required** — and
is configured to deploy straight to GitHub Pages.

- **Size:** ~1.5 MB of source (no `node_modules`). Well under GitHub's limits.
- **Works fully:** Dashboard, Job Orders, Work Items, Projects, Maintenance,
  Inventory, User Management, Roles, Departments, Permission Matrix,
  Notifications, Settings, and Workflows. (CRM, Customers, Equipment, Warehouse,
  Purchasing, Sales, and Reports show a "Coming Soon" page by design.)
- **Stack:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui.
- **Demo model:** in-browser mock services, frontend RBAC, configurable workflows,
  and session-only mutations that intentionally reset on refresh.

## Deploy to GitHub Pages (automatic)

1. Create a repository on GitHub and upload the **contents of this folder** to
   the repo **root** (so `package.json` and `index.html` sit at the top level).
2. Push to the `main` branch.
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub
   Actions**.
4. The included workflow (`.github/workflows/deploy-pages.yml`) builds the app
   and publishes it. Your site goes live at
   `https://<your-username>.github.io/<repo-name>/` in a minute or two.

That's it — GitHub installs the dependencies and builds the site for you; you
never upload `node_modules`.

## Run it locally (optional)

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # lint + type-check + production build
```

Sign in with the demo account:

```
Email:    admin@equiprime.ph
Password: Password123!
```

## Notes

- Business-data mutations are mocked in memory and reset on refresh. The demo
  auth token and theme preference are stored locally in the browser; mock-mode
  business data is not sent to a backend.
- Routing uses `HashRouter`, so application routes remain GitHub Pages-friendly
  (URLs look like `.../#/dashboard`).
- Permission keys use the `<module>:<action>` format. Sidebar items, protected
  routes, and UI actions all use the same RBAC model.
- Permission Matrix edits update the role's runtime permission source. Changes
  are reflected the next time a user with that role signs in.
- Job Orders, Projects, and Maintenance use the configurable workflow engine.
  Work Items intentionally use fixed statuses instead of a configurable
  workflow.
- New Job Orders, Projects, Maintenance records, and workflow edits record the
  currently signed-in user in their demo audit/history entries.
- Workflow approval labels use roles that exist in the seeded demo role catalog.
- Placeholder controls that implied unsupported behavior (global search, Help,
  "Keep me signed in", and attachment preview) are intentionally not shown.
  Seeded attachments are clearly marked as sample files.

## Validation

Before committing a change, run:

```bash
npm run check
```

This runs ESLint, the TypeScript check, and the production Vite build in one command.
