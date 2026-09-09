# Add Study Workflow

The Google Sheet remains the human-maintained source of truth for curated fields. The helper script reduces repetitive data entry by preparing a reviewed row from a Lichess study URL.

## Prepare a Row

```bash
npm run prepare:study -- https://lichess.org/study/{studyId} --category=Openings --side=Universal --tags="Sicilian, Najdorf" --description="Concise curator note"
```

The script:

- validates the Lichess study URL
- calls the Lichess study PGN export endpoint
- derives the study id, canonical URL, title, author when available, chapter count, and selected chapter
- prints a JSON review object
- prints a CSV row compatible with the current Sheet columns

The script does not write to Google Sheets and does not modify local study data.

## Review Before Adding

Before pasting the row into the Sheet:

- confirm the title is the intended public title
- confirm creator attribution is correct
- choose or correct the curated category, side, tags, and note
- leave the image field empty when the generated thumbnail pipeline can produce a board thumbnail

After the row is added to the Sheet, run the thumbnail generation workflow when thumbnails need to be refreshed.
