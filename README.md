# SwiftLinkIQ

**Discover Keywords. Unlock Opportunities.**

SwiftLinkIQ is a free, local-first SEO keyword research workspace aligned with the SwiftLink Ceylon Tours brand. It is a static React + TypeScript application designed for GitHub Pages. No account, backend, paid API or API key is required.

## Features

- Dashboard with local research activity, intent distribution and research history.
- Keyword Explorer with transparent estimated difficulty, intent classification and opportunity scoring.
- Bulk analysis for up to 500 pasted keywords per batch.
- Rule-based keyword suggestions and heuristic keyword clustering.
- Google Keyword Planner CSV import with preview and support for common exported column names.
- Saved keywords persisted in browser local storage.
- Exact-match comparison of user-imported competitor keyword lists.
- Google Trends handoff without inventing trend values.
- PDF report and CSV exports.
- Persistent light and dark themes.
- Responsive collapsible navigation and mobile drawer.
- Local data backup and clear-data controls.

## Important data policy

SwiftLinkIQ does **not** claim to provide official Google search volume, CPC, competition or historical trend data on its own. Keyword difficulty, intent and opportunity are WordIQ-style local heuristics and are labelled as estimates. Search volume, CPC and competition appear only when supplied through a user's imported dataset. Google Trends is opened externally; its relative-interest index is not absolute search volume.

The current competitor module compares keyword lists supplied by the user. It does not scrape search engines or retrieve private competitor analytics. Suggestions are generated locally and are not presented as live autocomplete results.

## Tech stack

- React 18, TypeScript, Vite
- React Router HashRouter (static-host friendly)
- Recharts, PapaParse, jsPDF, Lucide React
- LocalStorage for research, saved keywords and theme preference
- GitHub Pages + GitHub Actions

## Requirements

Node.js 20+ and npm.

## Install and run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production output is `dist/`.

## GitHub Pages deployment

1. Create a GitHub repository named `swiftlinkiq` (or update `base` in `vite.config.ts` to match your repository name).
2. Push this project to the `main` branch.
3. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.
4. The included `.github/workflows/deploy.yml` installs dependencies, builds the site and deploys `dist/` on every push to `main`.
5. The Vite base path is configured for `/swiftlinkiq/` when running in GitHub Actions. If the repository has a different name, update that path.

For a user/organization repository named `<username>.github.io`, change the Vite `base` to `/`.

## Data storage and privacy

All research and saved keywords stay in the browser's local storage. Clearing browser site data removes the locally stored information. Use Settings → Export backup to create a JSON backup before clearing data or changing browsers. No user account or remote analytics is implemented.

## Limitations and future extensions

- No live Google Ads, Search Console or Bing Webmaster integration is included; those require user-authorized integrations and credentials.
- IndexedDB migration, advanced mapping for unusual CSV schemas and semantic clustering can be added in future iterations.
- Trend history must be supplied by a legitimate data source or inspected on Google Trends; no historical series is fabricated.

## License

Choose and add a license before public redistribution. The repository is provided without an implied third-party data license.
