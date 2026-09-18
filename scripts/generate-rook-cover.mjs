import fs from 'node:fs/promises';
import vm from 'node:vm';
import { chromium } from 'playwright';
import { libraryContext } from './lib/library-context.mjs';
import { renderBoardSvg, validateFen, assertRenderedFenMatches, escapeXml } from './thumbnail-renderer.mjs';

const context = await libraryContext();
const study = context.window.generatedStudyData.studies.bnboDhFM;
if (!study?.pgnFetched || !validateFen(study.thumbnailFen)) throw new Error('Verified study position required');
const board = renderBoardSvg({ fen: study.thumbnailFen, orientation: study.orientation,
    title: study.title, pieceSymbolDefs: vm.runInContext('PIECE_SYMBOL_DEFS', context) });
assertRenderedFenMatches(board, study.thumbnailFen);
const placedBoard = board.replace('width="640" height="640"', 'x="620" y="60" width="600" height="600"');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Rook Endgames collection">
<title>Rook Endgames: Essential Positions</title>
<desc>Complete position from ${escapeXml(study.title)} by ${escapeXml(study.author)}. FEN: ${escapeXml(study.thumbnailFen)}. Orientation: ${study.orientation}.</desc>
<rect width="1280" height="720" fill="#10120f"/>
<path d="M60 64H540" stroke="#393d32"/>
<g font-family="Arial, sans-serif" fill="#f2efe5">
<text x="60" y="109" font-size="22" fill="#d5aa44">SCF / STUDY COLLECTION</text>
<text x="60" y="296" font-size="76" font-weight="400">Rook</text>
<text x="60" y="384" font-size="76" font-weight="400">Endgames</text>
<text x="64" y="442" font-size="27" fill="#c8bea4">Essential positions</text>
<text x="64" y="605" font-size="23" fill="#d5aa44">3 studies / Curated by Bosburp</text>
<text x="64" y="649" font-size="20" fill="#c8bea4">CHESS STUDY LIBRARY</text>
</g>
${placedBoard}
</svg>\n`;
await fs.mkdir('assets/collections', { recursive: true });
await fs.writeFile('assets/collections/rook-endgames.svg', svg);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`);
    await page.screenshot({ path: 'assets/collections/rook-endgames.png' });
} finally { await browser.close(); }
console.log('Rook cover: 1280x720 (16:9), complete 600x600 board, exact saved FEN verified.');
