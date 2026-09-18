# Study collections

`src/data/collections.js` holds curator selections, exact Lichess links, section order,
and editorial notes. Levels are curator guidance, not changes to the Sheet's metadata.
Creators, study titles and thumbnail choices still come from the existing library.

After editing selections, run:

```
npm run build:site
npm run test:collections
npm run check
npm run qa:static
```

The build reads the published Google Sheet without writing to it. It uses the same
parser, taxonomy and card renderer as the library, then writes four indexable HTML
pages under `collections/` and updates their sitemap entries. It fails if a selected
study is missing from the Sheet. Rebuild these pages when selected study metadata
changes; normal browser visits also refresh their cards from the Sheet.

Generated pages contain the actual collection content before JavaScript runs, have
individual titles, descriptions, canonical URLs and CollectionPage structured data.
They reuse the site shell and themes. The hidden library shell keeps existing modal
and shared application controls available. Author links return to the library's
author view; study links preserve the curator's exact chapter and open in a new tab.

The collections contain three rook-ending studies, 30 White repertoire selections,
and 26 Black repertoire selections supplied by Bosburp. The Black collection lives
at `/collections/bosburp-black-repertoire/`; both repertoire pages link to each other.
Its level/style guidance is editorial opinion, not a rating or engine assessment.
The Black overview uses its own editorial cover. No study rows or board thumbnails
were changed.

## Rook collection cover

`assets/collections/rook-endgames.png` is a 1280 x 720 (16:9) collection cover.
The accompanying SVG is its editable source. The full square board uses the saved
`bnboDhFM` thumbnail FEN and orientation from `generated/lichess-study-data.json`,
rendered with the existing site piece set. Source study: *Rook Endgames You Must Know!*
by NoseKnowsAll, https://lichess.org/study/bnboDhFM. The SVG description records the
exact FEN. No new position, artwork model, or external imagery is used.

Run `npm run generate:rook-cover` (requires Chrome), then `npm run build:collections`
after changing this cover. Its position is checked against the renderer before PNG
export. It is also used as the rook collection's Open Graph and Twitter share image.

## Bosburp collection cover

`assets/collections/bosburp-opening-repertoire.png` is a landscape cover composed
with the built-in image-generation tool from two images supplied by Bosburp:
the reading character on a stump and his painted Discord profile portrait.
These supplied images are not study-position data or board thumbnails.

Prompt: Compose a restrained 16:9 dark-charcoal editorial cover using both supplied
images, keeping the portrait and character recognizable. Put the portrait on the
right and the smaller character at lower left. Use cream modern sans-serif text
"Bosburp's Opening Recommendations" and muted-gold "WHITE REPERTOIRE". No invented
chessboards, extra figures, logos or ornate frames. Keep generous safe margins.

## Black repertoire cover

`assets/collections/bosburp-black-repertoire-v2.png` was composed with the built-in
image-generation tool using the orchard painting supplied by the user in chat.
It is an AI-composed adaptation, not an unaltered archival reproduction. No
external artwork was downloaded or independently attributed. This is collection
artwork, not a study-position thumbnail. The native landscape image is displayed
in the existing 16:9 contain box and used in Open Graph/Twitter previews.

Prompt: Create a premium 16:9 editorial cover using the supplied orchard painting
as the base. Preserve recognizable figures, blossoms, painted texture and muted
ochre/green/red colours. Use a broad charcoal title area on the left, the orchard
on the right, cream light/regular modern sans-serif text "Bosburp's Opening
Recommendations" and muted-gold "BLACK REPERTOIRE". Keep safe margins and readable
lettering at card size. No added people, chessboards, pieces, reading mascot,
other portraits, extra words, watermarks or ornate frames.

Final compositing edit (built-in image-generation tool): add the user-supplied
Bosburp reading-character/tree-stump logo beneath the subtitle in the empty
lower-left area. Preserve the green book and recognizable white/black logo;
remove its rectangular background and show the cover through stump cutouts.
Keep the existing painting, wording, typography and landscape composition.

Sharpness correction (built-in image-generation edit): use the sharp original
pre-logo cover as the base, retain the small logo, restore painting detail and
contrast, and remove cloudy texture, haze and logo glow. Keep lettering and
composition. Versioned filename prevents reuse of the earlier softened asset.
