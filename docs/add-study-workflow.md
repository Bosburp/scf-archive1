# Add Study Workflow

The Google Sheet remains the human-maintained source of truth for curated fields. The helper script reduces repetitive data entry by preparing a reviewed row from a Lichess study URL.

## Prepare a Row

```bash
npm run prepare:study -- https://lichess.org/study/{studyId} --category=Openings --side=Universal --tags="Sicilian, Najdorf" --description="Concise curator note"
```

The script:

- validates the Lichess study URL
- calls the official Lichess study PGN export endpoint
- chooses the explicit URL chapter when one is present, otherwise the first exported chapter
- follows that chapter's main line and derives the final FEN for deterministic board thumbnails
- derives the study id, canonical URL, title, author when available, chapter names, orientation, ECO/opening headers, starting FEN, thumbnail FEN, and expected thumbnail path
- prints a JSON review object
- prints a CSV row compatible with the current Sheet columns

The script does not write to Google Sheets, generate thumbnails, publish anything, or modify local study data.

## Review Before Adding

Before pasting the row into the Sheet:

- confirm the title is the intended public title
- confirm creator attribution is correct
- choose or correct the curated category, side, tags, and note
- leave the image field empty when the deterministic Lichess-derived FEN thumbnail should be used
- paste a manual screenshot URL in the Image field only when Lichess export is unavailable or the exact intended thumbnail position has not been reconstructed yet

After the row is added to the Sheet, run the thumbnail generation workflow when thumbnails need to be refreshed:

```bash
npm run generate:thumbnails
```

Studies whose Lichess export is disabled cannot be imported from PGN. Keep their manual metadata and manual screenshot/fallback image, and link directly to the original Lichess study.

## Replacing Screenshot Thumbnails

Manual screenshot URLs should be treated as position references, not permanent assets. Replace one only when the exact position shown in the screenshot is known.

Policy:

1. If Lichess export gives a reliable intended thumbnail FEN, use the deterministic generated board thumbnail.
2. If a screenshot thumbnail's exact position can be reconstructed, either add the repeated screenshot URL to the generator's exact screenshot-reference map or record that study's FEN in `generated/thumbnail-overrides.json`, then rerun `npm run generate:thumbnails`.
3. If the screenshot position cannot be reconstructed confidently, leave the screenshot in place and flag the study for manual resolution.

Do not replace a screenshot with the first study position, a guessed chapter, or a visually similar but different position.

The optional override file is local generated metadata. It lets us remove external screenshot dependencies without modifying the Google Sheet Image column. Use this structure:

```json
{
  "studies": {
    "studyIdHere": {
      "thumbnailFen": "8/8/8/8/8/8/8/8 w - - 0 1",
      "orientation": "white",
      "chapterId": "",
      "chapterName": "",
      "screenshotReferenceUrl": "https://example.com/original-screenshot.png",
      "note": "Exact FEN reconstructed from the screenshot on YYYY-MM-DD."
    }
  }
}
```

When an exact screenshot reference or override exists, the thumbnail generator renders that exact FEN with the standard renderer and the website uses the generated local SVG instead of the external screenshot.
