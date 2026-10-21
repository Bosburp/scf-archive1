# Deployment

The owner requested on 2026-10-21 that completed website updates always be deployed. Include production deployment and live verification in website work unless instructed otherwise.

Production: https://chessstudylibrary.vercel.app/

Push reviewed website changes to `main` on `Bosburp/scf-archive1`, then check the Vercel deployment status and verify the affected production pages. Keep local Discord automation settings and credentials out of deployments.

Refresh verified Lichess author titles with `node scripts/update-titled-authors.mjs`. Commit the resulting `generated/titled-authors.json` with the website changes. Run `node scripts/test-titled-authors.mjs` to check the filter in a browser.
