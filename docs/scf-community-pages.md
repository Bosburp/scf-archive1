# SCF Community Pages

The library stays at `/`. Existing query URLs, author views and the hidden
Endgame Trainer route remain unchanged. Navigation now includes the existing
collections, `/tournaments/` and `/about/`.

## Build

Run `npm run build:site` after shared-shell, collection or community-page edits.
It builds collections first, then reuses their shell to build the SCF pages and
three pilot study-detail pages. Google Sheet reads are read-only. Generated HTML
is a publication artifact, not an alternative study source of truth.

`scripts/build-community.mjs` contains community copy, the owner-supplied Swiss
schedule and original practice suggestions. Study titles, authors, images and
links come from the existing library parser. Collection recommendations stay in
`src/data/collections.js`. No positions or study metadata are inferred here.

The three rook-endgame entries have visible secondary Details links. Main card
links still open Lichess in a new tab, preserving selected chapters. Detail pages
distinguish SCF practice suggestions from the creators' original annotations.

## Tournament Boundary

The page publishes the five regular UTC slots supplied by the owner, including
time controls, rounds, team-only eligibility and the 48-hour creation window.
It links to the existing Lichess team and Discord. It does not claim live event
availability, fabricate tournament IDs or create tournaments.

The automated scheduler is outside this repository. Its repository/public feed
is still needed before actual upcoming events can be integrated read-only.

## SEO

Community and detail pages have static readable content, unique metadata and
self canonicals. Sitemap entries now cover actual canonical pages only; filter
URLs still work but canonicalize to the root library. GA4, Search Console HTML,
robots.txt and existing collection sharing images remain unchanged.

## Checks

Run the existing syntax, static, collection, thumbnail and browser checks.
Browser coverage includes the new routes at desktop/tablet/mobile widths, both
themes, thumbnail loading, exact chapter links and no-JavaScript content.

The separate homepage migration, live scheduler connection and broad study-detail
rollout are deliberately deferred. No empty navigation destinations are added.
