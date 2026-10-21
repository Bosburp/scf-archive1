# Deployment

The owner requested on 2026-10-21 that completed website updates always be deployed. Include production deployment and live verification in website work unless instructed otherwise.

Production: https://chessstudylibrary.vercel.app/

Push reviewed website changes to `main` on `Bosburp/scf-archive1`, then check the Vercel deployment status and verify the affected production pages. Keep local Discord automation settings and credentials out of deployments.

Refresh verified Lichess author titles with `node scripts/update-titled-authors.mjs`. Commit the resulting `generated/titled-authors.json` with the website changes. Run `node scripts/test-titled-authors.mjs` to check the filter in a browser.

Run `npm run build:site` after changing shared markup, card rendering, or utility classes. This regenerates collection/community pages and the static Tailwind stylesheet. Commit generated pages and `assets/site-utilities.css`; production does not compile CSS in the browser. `src/styles/refinement.css` contains the shared visual treatment.

Website checks: `npm run check`, `npm run qa:static`, `npm run test:collections`, `npm run test:collections:browser`, and `node scripts/test-site-refinement.mjs`. Browser scripts accept `QA_BASE_URL` to verify the deployed site. The refinement check covers mobile filter disclosure, overflow, keyboard/dialog focus and the absence of the runtime CSS compiler.
