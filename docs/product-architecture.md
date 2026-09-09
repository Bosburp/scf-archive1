# Chess Study Library Product Architecture

## Current Product: Chess Study Library

This repository is the Chess Study Library: a free community discovery layer associated with SCF.

- Community creators make the studies.
- Lichess hosts the original studies.
- SCF curates and organizes the catalogue so high-quality educational studies are easier to find.
- Each study should preserve creator attribution and link directly to the original Lichess study.
- The library should remain free.

## Future Platform Boundary

Future commercial training products should live in a separate product/project rather than turning this repository into a training platform.

- Chess Study Library: free SCF community discovery and curation.
- Future training platform: endgames, tactics, openings, courses, spaced repetition, game analysis, and other original training tools.

## Preserved Prototype: Endgame Trainer

The Endgame Trainer foundation is preserved in this repository as future-project groundwork, but it is not part of the primary Chess Study Library navigation.

- Route state: `?view=endgames`.
- Catalogue data: `src/data/endgame-trainer.js`.
- Runtime logic: `src/app/endgame-trainer.js`.
- Current category: Fundamentals / King + Queen vs King.
- Current progress storage: local browser storage keyed by stable position ids.

This keeps the trainer independent from Lichess community studies and makes it easier to extract into a future standalone training product.

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
