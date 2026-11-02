# SwiftLinkIQ

A lightweight Google Trends-style search interface using the SwiftLink Ceylon Tours forest-green and lime brand palette.

## Features

- Search term and filters for location, date range, category and Google search property.
- Google Trends embedded widgets for interest over time, interest by region, related topics and related queries (subject to Google's embed availability and browser/network access).
- Direct link to the full Google Trends Explore report if an embedded chart is unavailable.
- Trending Now handoff to Google's public Trending Now page.
- Locally saved searches and light/dark theme.
- GitHub Pages deployment through GitHub Actions.
- No API key, backend, database, account or paid service required.

## Important data limitations

SwiftLinkIQ does not scrape Google's private endpoints or fabricate search data. Explore widgets are rendered by Google's official embed loader. Google notes that chart embedding is not available for every chart. If a widget cannot load, use the provided link to open the same search on Google Trends.

Google's public BigQuery Trends dataset is not connected in this version. It contains selected top and rising queries, not arbitrary keyword Explore reports. Connecting it would require a server-side BigQuery integration. The Trending Now page therefore links to Google's public Trending Now experience instead of displaying invented data.

Google Trends values are relative, normalized interest indices (0–100), not absolute search counts. Attribute reused Trends data to Google.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Push this repository to GitHub with the repository name `SwiftLink-IQ`.
2. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main`. The workflow builds and deploys the `dist` directory.

The Vite base path is configured as `/SwiftLink-IQ/` in GitHub Actions builds. If you rename the repository, update `vite.config.ts`.

## Storage and privacy

Saved searches and theme preference are stored in the visitor's browser using localStorage. They are not uploaded or synchronized.

## Attribution

Google Trends is a Google service. SwiftLinkIQ is an independent interface and is not affiliated with Google. See [Google Trends Help](https://support.google.com/trends/answer/4365538) for embedding and attribution guidance.
