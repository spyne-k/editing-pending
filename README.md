# Metabase → GitHub Pages Dashboard

This dashboard reads Metabase Question **6501** and publishes the latest result to GitHub Pages.

## Security

Metabase username/password are stored only as **GitHub Actions Secrets**:

- `METABASE_USERNAME`
- `METABASE_PASSWORD`

They are used by the GitHub Actions runner and are **never included in HTML/JS/source code** and never sent to the browser.

> Important: GitHub Pages is a static site. It cannot securely make a live Metabase request from browser JavaScript with a username/password. This implementation therefore refreshes the data through GitHub Actions and publishes only the resulting JSON. The dashboard can be refreshed as often as GitHub Actions allows (the workflow is configured for every 5 minutes).

## Setup

1. Create a GitHub repository and upload these files.
2. In **Settings → Secrets and variables → Actions**, add:
   - `METABASE_USERNAME`
   - `METABASE_PASSWORD`
3. Enable GitHub Pages using **GitHub Actions** as the source.
4. Run the `Refresh Metabase Data` workflow once manually.
5. Open the Pages URL.

## Metabase API

The workflow logs into Metabase with `/api/session`, then queries Question 6501 using `/api/card/6501/query`. The session token exists only inside the runner and is never written to the generated site.

If your Metabase instance requires MFA/SSO or blocks API login, use a Metabase API key instead and store it as `METABASE_API_KEY`.
