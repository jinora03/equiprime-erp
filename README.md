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
```

Sign in with the demo account:

```
Email:    admin@equiprime.ph
Password: Password123!
```

## Notes

- All data is mocked and resets on refresh. Nothing is persisted or sent
  anywhere.
- Routing uses `HashRouter` and a relative asset base so deep links and page
  refreshes work correctly on GitHub Pages (URLs look like `.../#/dashboard`).
