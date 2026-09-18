# SCF Site Evolution: Phase 1 Audit

Status: original Phase 1 audit. For the implemented pages and remaining external
scheduler dependency, see `docs/scf-community-pages.md`.

## Existing implementation

- `/`: `index.html`, the working library, including the SCF introduction,
  search, filters, Featured Study, catalogue, header, footer and community links.
- `/?author=...`: author view, not an independent HTML page.
- Library URL state: `q`, `category`, `opening`, `variation`, `side`, `staff`,
  `authorFilter`, `theme`, `sort`. Preserve browser history behavior.
- `/?view=endgames`: preserved trainer prototype, outside public navigation.
- `/collections/`, `/collections/rook-endgames/`, and
  `/collections/bosburp-opening-repertoire/`: generated static pages.
- About and Submit Study currently open modals, not separate routes.
- No individual study detail pages or tournament pages are implemented.
- No Swiss scheduler, tournament feed, or deployment routing configuration was
  found in the inspected repository. Do not recreate the external automation.

`src/app/app.js` owns the library behavior and reads the published study and
author Google Sheet CSVs. The Sheet remains the study source of truth.
`src/data/collections.js` holds editorial selections, not replacement study rows.
`scripts/build-collections.mjs` builds collection HTML from the root shell,
reuses library rendering, and updates collection sitemap entries.

Collection author links explicitly target `/?author=...`; generated footer links
target `/` and `/#latestSection`. Shell changes must therefore be tested on both
the root and regenerated collection pages. Do not edit generated pages alone.

## Recommended initial URL map

| URL | Purpose | Action |
| --- | --- | --- |
| `/` | Library-first SCF entry point | Keep search/studies directly accessible |
| `/?...` | Existing library/author/trainer states | Preserve unchanged |
| `/collections/` | Curated directory | Preserve |
| `/collections/<existing-slug>/` | Editorial collections | Preserve |
| `/tournaments/` | Daily Swiss schedule and verified event links | Add next |
| `/about/` | Community story and participation | Add next |
| `/studies/<study-id>/` | Useful study details | Later, only with substantive content |

Initial navigation: Library, Collections, Tournaments, About. Add destinations
only when their pages exist. Retain actual Discord, Lichess and submission actions.
Do not add both Home and Library links pointing to identical content.

Defer a separate homepage and `/library/` migration. A compact SCF introduction
can live above the existing library without adding an extra click. If separate
Home and Library pages are eventually required, first plan query-string and
fragment compatibility, collection author links, trainer routing, canonicals,
and redirects. Do not duplicate the catalogue at two indexable URLs.

## Tournament source and boundaries

The following schedule was supplied by the owner in a screenshot. It is a
recurring schedule, not independently verified live event availability.

| UTC daily | Tournament | Time control | Rounds |
| --- | --- | --- | --- |
| 00:00 | SCF Americas Swiss | 5+0 | 7 |
| 04:00 | SCF Asia-Pacific Swiss | 3+2 | 7 |
| 09:00 | SCF Global Morning Swiss | 5+0 | 7 |
| 14:00 | SCF Global Rapid Swiss | 10+0 | 5 |
| 19:00 | SCF Prime Swiss | 3+2 | 9 |

Owner-supplied rules: rated standard chess, SCF team members only; tournaments
are created 48 hours before their scheduled starts. Display UTC explicitly.

Existing verified-in-code community destinations:
- Lichess: https://lichess.org/team/study-creators--friends
- Discord: https://discord.gg/sD7sCvyHMa

First tournament page can publish the schedule and link to the existing team.
Label it as the regular schedule, not a list of confirmed upcoming events.
Do not invent tournament IDs, join URLs, results or live status. Before wiring
live events, obtain the scheduler repository or its public output/feed from the
owner, then inspect its actual contract. Only read public event data; scheduling,
creation credentials and tournament management remain in the existing system.
Missing/stale live data should leave the regular schedule and team link usable.

## SEO and content boundaries

Preserve GA4, verification HTML, robots.txt and existing metadata while adding
unique titles, descriptions, canonicals and sitemap entries for real new pages.
Current root canonical is `/`, while the sitemap also lists filtered root URLs.
Review that mismatch during the SEO phase; filter states must not be presented
as unique editorial pages merely because they have different query strings.

Study detail links should be understated but visible and accessible. Keep card
primary actions opening Lichess in a new tab. Details must add accurate original
context and creator attribution, not simply duplicate a title or invent ratings.
Use stable study IDs and retain the intended chapter link. No bulk thin pages.

## Implementation sequence

1. Keep this route map as the initial plan; preserve the approved design.
2. Add static Tournament and About pages using the existing visual shell.
   Reuse existing community copy without inventing history or ownership claims.
3. Update navigation consistently, regenerate collections, and test existing
   library states. Keep the root library immediately usable.
4. Add restrained links/previews for the real new sections, not a giant hero.
5. Integrate read-only tournament event data after inspecting the scheduler source.
6. Pilot useful study details for a small selection before expanding.
7. Review metadata, sitemap consistency, internal links and deployment responses.

## Validation for implementation

Run `npm run check`, `npm run qa:static`, `npm run test:collections`,
`npm run test:collections:browser`, `npm run test:thumbnails`, and
`git diff --check`. Extend route tests for the new pages.

Check desktop/mobile and both themes; existing author/filter deep links and
back/forward; exact Lichess chapter links; collections; Featured Study; saved
preferences; `?view=endgames`; no-JavaScript editorial content; keyboard access;
empty/error states; no broken assets or console errors. Verify no study Sheet,
generated FEN, thumbnail or taxonomy changes. Deploy only at an agreed stage.
