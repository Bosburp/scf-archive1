import crypto from 'node:crypto';
import { Chess } from 'chess.js';

export const THUMBNAIL_SIZE = 640;
export const THUMBNAIL_RENDERER_ID = 'site-piece-symbols-v3';

export function fenBoardOnly(fen) {
  return String(fen || '').split(' ')[0];
}

export function fenHash(fen) {
  return crypto.createHash('sha1').update(fen).digest('hex').slice(0, 10);
}

export function expandFenBoard(fen) {
  const board = fenBoardOnly(fen);
  const rows = board.split('/');
  if (rows.length !== 8) throw new Error(`Invalid FEN rows: ${fen}`);

  return rows.map(row => {
    const squares = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < Number(ch); i++) squares.push('');
      } else {
        squares.push(ch);
      }
    }
    if (squares.length !== 8) throw new Error(`Invalid FEN row: ${row}`);
    return squares;
  });
}

export function validateFen(fen) {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function squareName(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}

export function renderBoardSvg({ fen, title = 'Chess position', orientation = 'white', pieceSymbolDefs = '' }) {
  const grid = expandFenBoard(fen);
  const size = THUMBNAIL_SIZE;
  const sq = size / 8;
  const light = '#e8dcc4';
  const dark = '#8a7458';
  const normalizedOrientation = String(orientation).toLowerCase() === 'black' ? 'black' : 'white';
  const coords = normalizedOrientation === 'black'
    ? { row: r => 7 - r, col: c => 7 - c }
    : { row: r => r, col: c => c };

  let squares = '';
  let pieces = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const boardRow = coords.row(r);
      const boardCol = coords.col(c);
      const x = c * sq;
      const y = r * sq;
      squares += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${(boardRow + boardCol) % 2 === 0 ? light : dark}" data-square="${squareName(boardRow, boardCol)}"/>`;
      const piece = grid[boardRow][boardCol];
      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        const colorPrefix = isWhite ? 'w' : 'b';
        const piecePad = sq * 0.035;
        pieces += `<use href="#piece-${colorPrefix}${piece.toLowerCase()}" x="${x + piecePad}" y="${y + piecePad}" width="${sq - piecePad * 2}" height="${sq - piecePad * 2}" data-square="${squareName(boardRow, boardCol)}" data-piece="${piece}"/>`;
      }
    }
  }

  const label = escapeXml(title).slice(0, 72);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}" data-renderer="${THUMBNAIL_RENDERER_ID}" data-orientation="${normalizedOrientation}">
  <defs>${pieceSymbolDefs}</defs>
  ${squares}
  ${pieces}
</svg>`;
}

export function expectedPiecesFromFen(fen) {
  const grid = expandFenBoard(fen);
  const pieces = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (grid[row][col]) pieces.push({ square: squareName(row, col), piece: grid[row][col] });
    }
  }
  return pieces;
}

export function renderedPiecesFromSvg(svg) {
  return [...String(svg).matchAll(/<use\b[^>]*data-square="([^"]+)"[^>]*data-piece="([^"]+)"/g)]
    .map(match => ({ square: match[1], piece: match[2] }));
}

export function assertRenderedFenMatches(svg, fen) {
  const expected = expectedPiecesFromFen(fen)
    .map(piece => `${piece.square}:${piece.piece}`)
    .sort();
  const actual = renderedPiecesFromSvg(svg)
    .map(piece => `${piece.square}:${piece.piece}`)
    .sort();

  if (expected.length !== actual.length || expected.some((piece, index) => piece !== actual[index])) {
    throw new Error(`Rendered pieces do not match FEN.\nExpected: ${expected.join(' ')}\nActual: ${actual.join(' ')}`);
  }

  const rectCount = (String(svg).match(/<rect\b/g) || []).length;
  if (rectCount !== 64) throw new Error(`Expected 64 board squares, found ${rectCount}`);
  if (!String(svg).includes(`width="${THUMBNAIL_SIZE}" height="${THUMBNAIL_SIZE}" viewBox="0 0 ${THUMBNAIL_SIZE} ${THUMBNAIL_SIZE}"`)) {
    throw new Error('Thumbnail SVG is not the expected fixed square size');
  }
}
