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
