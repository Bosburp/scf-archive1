# Product Architecture

## Current Surface: SCF Community Library

The existing study library is the free community discovery layer.

- Community creators make the studies.
- Lichess hosts the original studies.
- SCF curates and organizes the catalogue so high-quality educational studies are easier to find.
- Each study should preserve creator attribution and link directly to the original Lichess study.
- The community library should not be placed behind a future premium subscription.

## Future Platform Areas

Future training products should remain conceptually separate from the community library.

- Explore: Community Library, videos, creators.
- Train: tactics, openings, endgames, courses, personal training, progress tracking, analysis.
- Original platform content/tools can be monetized separately from community study discovery.

## Initial Training Product: Endgame Trainer

The first training surface is a separate Endgame Trainer available through the application shell, not through the SCF Community Library data model.

- Route state: `?view=endgames`.
- Catalogue data: `src/data/endgame-trainer.js`.
- Runtime logic: `src/app/endgame-trainer.js`.
- Current category: Fundamentals / King + Queen vs King.
- Current progress storage: local browser storage keyed by stable position ids.

This keeps the trainer independent from Lichess community studies while letting the broader platform grow around the same header, footer, theme system, and visual language.

The first implementation validates legal king and queen moves directly in the browser and records only real local attempts, successes, mistakes, and best conversion length. A larger production catalogue should add a tablebase/engine-backed validation layer before expanding into complex theoretical endgames.

## Data Ownership Principle

Each study-like item should eventually distinguish:

- original creator
- original URL
- source platform
- community curation status
- platform-original content status

Existing study records, generated thumbnails, taxonomy, and Lichess links should remain intact unless a future migration explicitly handles them.

## Branding

The final platform name is not locked. UI copy should avoid embedding retired product names and should keep brand labels isolated so a future rename can be made without touching the study system.
