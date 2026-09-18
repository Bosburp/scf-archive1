# Study collections

`src/data/collections.js` holds curator selections, exact Lichess links, section order,
and editorial notes. Levels are curator guidance, not changes to the Sheet's metadata.
Creators, study titles and thumbnail choices still come from the existing library.

After editing selections, run:

```
npm run build:collections
npm run test:collections
npm run check
npm run qa:static
```

The build reads the published Google Sheet without writing to it. It uses the same
parser, taxonomy and card renderer as the library, then writes three indexable HTML
pages under `collections/` and updates their sitemap entries. It fails if a selected
study is missing from the Sheet. Rebuild these pages when selected study metadata
changes; normal browser visits also refresh their cards from the Sheet.

Generated pages contain the actual collection content before JavaScript runs, have
individual titles, descriptions, canonical URLs and CollectionPage structured data.
They reuse the site shell and themes. The hidden library shell keeps existing modal
and shared application controls available. Author links return to the library's
author view; study links preserve the curator's exact chapter and open in a new tab.

The initial collections contain three rook-ending studies and 30 White repertoire
recommendations supplied by Bosburp. No Black repertoire has been invented.

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
