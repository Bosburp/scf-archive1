import fs from 'node:fs/promises';
import { assertRenderedFenMatches, renderBoardSvg } from './thumbnail-renderer.mjs';

async function loadPieceSymbolDefs() {
  const source = await fs.readFile('src/app/app.js', 'utf8');
  const match = source.match(/const PIECE_SYMBOL_DEFS = `([\s\S]*?)`;/);
  if (!match) throw new Error('Could not find PIECE_SYMBOL_DEFS in src/app/app.js');
  return match[1].trim();
}

const positions = [
  {
    name: 'initial position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    orientation: 'white',
  },
  {
    name: 'queen and rooks',
    fen: '2r3k1/5ppp/p3p3/1p1qP3/3P4/P1Q2N2/1P3PPP/2R3K1 b - - 2 28',
    orientation: 'white',
  },
  {
    name: 'few-piece ending',
    fen: '8/8/8/3k4/8/3K4/4P3/8 w - - 0 1',
    orientation: 'black',
  },
  {
    name: 'many pieces black orientation',
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP3PPP/RNBQ1RK1 w - - 4 8',
    orientation: 'black',
  },
];

const pieceSymbolDefs = await loadPieceSymbolDefs();

for (const position of positions) {
  const first = renderBoardSvg({
    fen: position.fen,
    title: position.name,
    orientation: position.orientation,
    pieceSymbolDefs,
  });
  const second = renderBoardSvg({
    fen: position.fen,
    title: position.name,
    orientation: position.orientation,
    pieceSymbolDefs,
  });

  if (first !== second) throw new Error(`${position.name}: renderer is not deterministic`);
  assertRenderedFenMatches(first, position.fen);
}

console.log(`Thumbnail renderer OK: ${positions.length} deterministic FEN renders verified.`);
