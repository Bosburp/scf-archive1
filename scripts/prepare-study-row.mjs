import { Chess } from 'chess.js';
import { fenHash, validateFen } from './thumbnail-renderer.mjs';

const SHEET_COLUMNS = [
  'Status',
  'Side',
  'Category',
  'Title',
  'Author',
  'Lichess URL',
  'Notes',
  'Viewer Note',
  'Image',
  'Difficulty',
  'Created At',
  'Keyword',
  'Featured Description',
];

const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const result = { _: [] };
  for (const item of argv) {
    if (!item.startsWith('--')) {
      result._.push(item);
      continue;
    }
    const [key, rawValue = 'true'] = item.slice(2).split('=');
    result[key] = rawValue;
  }
  return result;
}

function usage() {
  console.log(`Usage:
  npm run prepare:study -- <lichess-study-url> [--category=Openings] [--side=Universal] [--tags=tag1,tag2] [--description="Short curator note"]

This prepares a Google Sheet-compatible row. It does not edit the Sheet or write study data.`);
}

function getLichessStudyParts(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if (host !== 'lichess.org' || parts[0] !== 'study' || !parts[1]) return null;
    return {
      studyId: parts[1],
      explicitChapterId: parts[2] || null,
      canonicalUrl: `https://lichess.org/study/${parts[1]}${parts[2] ? `/${parts[2]}` : ''}`,
    };
  } catch {
    return null;
  }
}

function parseHeaders(pgn) {
  const headers = {};
  for (const match of pgn.matchAll(/^\[([A-Za-z0-9_]+)\s+"((?:\\"|[^"])*)"\]\s*$/gm)) {
    headers[match[1]] = match[2].replace(/\\"/g, '"');
  }
  return headers;
}

function splitPgnGames(pgn) {
  const starts = [...pgn.matchAll(/^\[Event\s+"/gm)].map(match => match.index);
  if (!starts.length) return [];
  return starts.map((start, index) => pgn.slice(start, starts[index + 1] ?? pgn.length).trim()).filter(Boolean);
}

function chapterIdFromHeaders(headers) {
  const site = headers.Site || '';
  const parts = site.split('/').filter(Boolean);
  const maybeChapter = parts[parts.length - 1];
  return /^[A-Za-z0-9]{8}$/.test(maybeChapter) ? maybeChapter : '';
}

function stripVariationsAndComments(pgn) {
  let out = '';
  let commentDepth = 0;
  let variationDepth = 0;
  let nag = false;

  for (let i = 0; i < pgn.length; i++) {
    const ch = pgn[i];

    if (commentDepth) {
      if (ch === '}') commentDepth--;
      continue;
    }
    if (variationDepth) {
      if (ch === '(') variationDepth++;
      else if (ch === ')') variationDepth--;
      continue;
    }
    if (nag) {
      if (!/\d/.test(ch)) {
        nag = false;
        out += ch;
      }
      continue;
    }

    if (ch === '{') commentDepth++;
    else if (ch === '(') variationDepth++;
    else if (ch === '$') nag = true;
    else out += ch;
  }

  return out;
}

function cleanAuthor(value) {
  const text = (value || '').trim();
  const lichessMatch = text.match(/lichess\.org\/@\/([^/?#]+)/i);
  return (lichessMatch ? lichessMatch[1] : text).replace(/^@+/, '').trim();
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function fetchStudyPgn(studyId) {
  const endpoint = `https://lichess.org/api/study/${studyId}.pgn?orientation=true&comments=false&variations=false&clocks=false`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/x-chess-pgn,text/plain;q=0.9,*/*;q=0.5',
      'User-Agent': 'Chess Study Library curator tool',
    },
  });
  if (!response.ok) {
    const error = new Error(`Lichess export failed with ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.text();
}

async function main() {
  const inputUrl = args._[0] || args.url;
  if (!inputUrl || args.help) {
    usage();
    process.exit(inputUrl ? 0 : 1);
  }

  const parts = getLichessStudyParts(inputUrl);
  if (!parts) throw new Error('Expected a URL like https://lichess.org/study/{studyId} or /study/{studyId}/{chapterId}');

  let pgn = '';
  let exportWarning = '';
  try {
    pgn = await fetchStudyPgn(parts.studyId);
  } catch (error) {
    exportWarning = `${error.message}. The study may have export/sharing disabled; review title and author manually.`;
  }

  const games = pgn ? splitPgnGames(pgn) : [];
  const chapters = games.map((game, index) => {
    const headers = parseHeaders(game);
    return {
      index,
      chapterId: chapterIdFromHeaders(headers),
      chapterName: headers.ChapterName || headers.Event || `Chapter ${index + 1}`,
      orientation: (headers.Orientation || 'white').toLowerCase() === 'black' ? 'black' : 'white',
      headers,
      pgn: game,
    };
  });
  const selectedChapter = parts.explicitChapterId
    ? chapters.find(chapter => chapter.chapterId === parts.explicitChapterId) || chapters[0]
    : chapters[0];
  const selectedGame = selectedChapter?.pgn || pgn;
  const headers = selectedChapter?.headers || (selectedGame ? parseHeaders(selectedGame) : {});

  let startFen = '';
  let thumbnailFen = '';
  let thumbnailWarning = '';
  if (selectedGame) {
    try {
      const chess = new Chess();
      const mainlinePgn = stripVariationsAndComments(selectedGame);
      chess.loadPgn(mainlinePgn, { strict: false });
      startFen = headers.FEN || new Chess().fen();
      thumbnailFen = chess.fen();
    } catch (error) {
      thumbnailWarning = `Could not derive final main-line FEN: ${error.message}`;
    }
  }

  const title = (args.title || headers.StudyName || headers.Event || '').trim();
  const author = cleanAuthor(args.author || headers.Annotator || headers.White || headers.Black || '');
  const category = args.category || '';
  const side = args.side || headers.Orientation || 'Universal';
  const description = args.description || args.notes || '';
  const tags = args.tags || '';
  const createdAt = new Date().toISOString().slice(0, 10);
  const selectedChapterId = selectedChapter?.chapterId || parts.explicitChapterId || '';
  const expectedThumbnailPath = thumbnailFen
    ? `assets/thumbnails/${parts.studyId}-${selectedChapterId || 'chapter1'}-${fenHash(thumbnailFen)}.svg`
    : '';

  const row = {
    Status: 'Ready for review',
    Side: side,
    Category: category,
    Title: title,
    Author: author,
    'Lichess URL': parts.canonicalUrl,
    Notes: tags,
    'Viewer Note': description,
    Image: '',
    Difficulty: args.difficulty || '',
    'Created At': createdAt,
    Keyword: '',
    'Featured Description': '',
  };

  const derived = {
    studyId: parts.studyId,
    explicitChapterId: parts.explicitChapterId,
    chapterCount: games.length,
    selectedChapterId,
    selectedChapterTitle: selectedChapter?.chapterName || headers.ChapterName || headers.Event || '',
    chapterNames: chapters.map(chapter => chapter.chapterName),
    chapterIds: chapters.map(chapter => chapter.chapterId).filter(Boolean),
    title,
    author,
    url: parts.canonicalUrl,
    canonicalStudyUrl: `https://lichess.org/study/${parts.studyId}`,
    orientation: selectedChapter?.orientation || String(side).toLowerCase(),
    eco: headers.ECO || '',
    opening: headers.Opening || '',
    startFen,
    thumbnailFen,
    thumbnailFenValid: thumbnailFen ? validateFen(thumbnailFen) : false,
    thumbnailSource: thumbnailFen ? 'generated-fen' : 'manual-or-fallback',
    expectedThumbnailPath,
    thumbnailRule: 'explicit URL chapter when present, otherwise first exported chapter; final main-line position',
    exportWarning,
    thumbnailWarning,
  };

  console.log(JSON.stringify({ derived, row }, null, 2));
  console.log('\nCSV row:');
  console.log(SHEET_COLUMNS.map(column => csvCell(row[column])).join(','));
}

main().catch(error => {
  console.error(`prepare-study-row failed: ${error.message}`);
  process.exit(1);
});
