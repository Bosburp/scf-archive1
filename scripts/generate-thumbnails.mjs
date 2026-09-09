import fs from 'node:fs/promises';
import path from 'node:path';
import { Chess } from 'chess.js';
import { fenHash, renderBoardSvg, THUMBNAIL_RENDERER_ID, validateFen } from './thumbnail-renderer.mjs';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHRh0KZ6s0XfeHMyIFdR-WjWI_t7QOfR8gknJOLZpJlAKkDEWtoDw-RpqHj27TAv17t7xvcfNGqn13/pub?output=csv';
const OUT_FILE = 'generated/lichess-study-data.json';
const THUMBNAIL_OVERRIDES_FILE = 'generated/thumbnail-overrides.json';
const THUMB_DIR = 'assets/thumbnails';
const DEFAULT_CONCURRENCY_DELAY_MS = 350;

const SCREENSHOT_FEN_REFERENCES = {
  'https://i.postimg.cc/h4NHxq4h/6Wy-GX2R-1.png': {
    thumbnailFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    orientation: 'white',
    note: 'Screenshot shows the position after 1.e4 e5.',
  },
  'https://i.ibb.co/dJfdLCbZ/image.png': {
    thumbnailFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    orientation: 'white',
    note: 'Screenshot shows the position after 1.e4 c5.',
  },
  'https://i.postimg.cc/ZRZGWPJp/85s-GXGw-1.png': {
    thumbnailFen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
    orientation: 'white',
    note: 'Screenshot shows the position after 1.d4.',
  },
};

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));

const limit = args.has('limit') ? Number(args.get('limit')) : Infinity;
const only = args.get('only');
const rerenderExisting = args.has('rerender-existing');
let pieceSymbolDefs = '';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function getLichessStudyParts(link) {
  try {
    const url = new URL(link);
    if (!/lichess\.org$/i.test(url.hostname.replace(/^www\./i, ''))) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'study' || !parts[1]) return null;
    return {
      studyId: parts[1],
      explicitChapterId: parts[2] || null,
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

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? pgn.length;
    return pgn.slice(start, end).trim();
  }).filter(Boolean);
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

async function loadPieceSymbolDefs() {
  const source = await fs.readFile('src/app/app.js', 'utf8');
  const match = source.match(/const PIECE_SYMBOL_DEFS = `([\s\S]*?)`;/);
  if (!match) throw new Error('Could not find PIECE_SYMBOL_DEFS in src/app/app.js');
  return match[1].trim();
}

async function readExistingGenerated() {
  try {
    return JSON.parse(await fs.readFile(OUT_FILE, 'utf8'));
  } catch {
    return { generatedAt: null, source: 'lichess-study-export', studies: {} };
  }
}

async function readThumbnailOverrides() {
  try {
    const parsed = JSON.parse(await fs.readFile(THUMBNAIL_OVERRIDES_FILE, 'utf8'));
    return parsed.studies || {};
  } catch {
    return {};
  }
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchStudyPgn(studyId) {
  const url = `https://lichess.org/api/study/${studyId}.pgn?orientation=true&comments=false&variations=false&clocks=false`;
  const headers = { Accept: 'application/x-chess-pgn' };
  if (process.env.LICHESS_TOKEN) headers.Authorization = `Bearer ${process.env.LICHESS_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return {
    pgn: await res.text(),
    lastModified: res.headers.get('last-modified') || '',
  };
}

async function main() {
  pieceSymbolDefs = await loadPieceSymbolDefs();
  await fs.mkdir(THUMB_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

  if (rerenderExisting) {
    const generated = await readExistingGenerated();
    const entries = Object.values(generated.studies || {})
      .filter(study => study.thumbnailFen && study.thumbnailPath)
      .filter(study => !only || study.studyId === only)
      .slice(0, Number.isFinite(limit) ? limit : undefined);

    let rerendered = 0;
    for (const study of entries) {
      await fs.writeFile(study.thumbnailPath, renderBoardSvg({
        fen: study.thumbnailFen,
        title: study.title || study.studyId,
        orientation: study.orientation,
        pieceSymbolDefs,
      }), 'utf8');
      rerendered++;
      console.log(`rerendered ${study.studyId} ${study.thumbnailPath}`);
    }

    console.log(JSON.stringify({ rerendered }, null, 2));
    return;
  }

  const csv = await fetchText(SHEET_URL);
  const rows = parseCSV(csv);
  const studies = rows.slice(1).map((c, index) => ({
    rowNumber: index + 2,
    side: c[1]?.replace(/"/g, '') || 'Universal',
    category: c[2]?.replace(/"/g, '') || 'General',
    title: c[3]?.replace(/"/g, '') || 'Untitled',
    author: c[4]?.replace(/"/g, '') || 'Anonymous',
    link: c[5]?.replace(/"/g, '') || '#',
    notes: c[6]?.replace(/"/g, '') || '',
    viewerNote: c[7]?.replace(/"/g, '')?.trim() || '',
    manualImage: c[8]?.replace(/"/g, '').trim() || '',
    difficulty: c[9]?.replace(/"/g, '').trim() || '',
    keyword: c[11]?.replace(/"/g, '').trim() || '',
  })).filter(study => study.title && study.link);

  const generated = await readExistingGenerated();
  const thumbnailOverrides = await readThumbnailOverrides();
  generated.source = 'lichess-study-export';
  generated.thumbnailRule = 'first explicit URL chapter, otherwise first exported chapter; final mainline position';
  generated.studies ||= {};
  const processedStudyIds = new Set();
  const failures = [];
  let processed = 0;

  for (const study of studies) {
    const parts = getLichessStudyParts(study.link);
    if (!parts) continue;
    if (only && parts.studyId !== only) continue;
    if (processed >= limit) break;

    const previous = generated.studies[parts.studyId];
    const screenshotReference = SCREENSHOT_FEN_REFERENCES[study.manualImage];
    const override = thumbnailOverrides[parts.studyId] || screenshotReference;
    try {
      if (override?.thumbnailFen) {
        if (!validateFen(override.thumbnailFen)) {
          throw new Error(`Invalid thumbnail override FEN for ${parts.studyId}`);
        }
        const overrideChapterId = override.chapterId || parts.explicitChapterId || 'screenshot';
        const hash = fenHash(override.thumbnailFen);
        const thumbnailPath = `${THUMB_DIR}/${parts.studyId}-${overrideChapterId}-${hash}.svg`.replace(/\\/g, '/');
        await fs.writeFile(thumbnailPath, renderBoardSvg({
          fen: override.thumbnailFen,
          title: study.title,
          orientation: override.orientation || study.side,
          pieceSymbolDefs,
        }), 'utf8');

        generated.studies[parts.studyId] = {
          ...(previous || {}),
          studyId: parts.studyId,
          sourceUrl: study.link,
          rowNumber: study.rowNumber,
          title: study.title,
          author: study.author,
          selectedChapterId: override.chapterId || parts.explicitChapterId || '',
          selectedChapterName: override.chapterName || previous?.selectedChapterName || '',
          startFen: override.startFen || previous?.startFen || '',
          thumbnailFen: override.thumbnailFen,
          orientation: override.orientation || previous?.orientation || 'white',
          searchText: previous?.searchText || [
            study.title,
            study.author,
            study.category,
            study.side,
            study.difficulty,
            study.notes,
            study.viewerNote,
          ].filter(Boolean).join(' '),
          thumbnailPath,
          thumbnailSource: thumbnailOverrides[parts.studyId] ? 'screenshot-fen-override' : 'screenshot-fen-reference',
          screenshotReferenceUrl: override.screenshotReferenceUrl || study.manualImage || '',
          screenshotResolutionNote: override.note || '',
          renderer: THUMBNAIL_RENDERER_ID,
          pgnFetched: previous?.pgnFetched || false,
          error: previous?.error || '',
          updatedAt: new Date().toISOString(),
        };

        processedStudyIds.add(parts.studyId);
        processed++;
        console.log(`override ${parts.studyId} ${overrideChapterId} ${override.thumbnailFen}`);
        continue;
      }

      await sleep(DEFAULT_CONCURRENCY_DELAY_MS);
      const { pgn, lastModified } = await fetchStudyPgn(parts.studyId);
      const chapters = splitPgnGames(pgn);
      if (!chapters.length) throw new Error('No PGN chapters exported');

      const chapterEntries = chapters.map((chapterPgn, chapterIndex) => {
        const headers = parseHeaders(chapterPgn);
        return {
          chapterIndex,
          chapterId: chapterIdFromHeaders(headers),
          chapterName: headers.ChapterName || headers.Event || `Chapter ${chapterIndex + 1}`,
          orientation: (headers.Orientation || 'white').toLowerCase(),
          headers,
          pgn: chapterPgn,
        };
      });

      const selected = parts.explicitChapterId
        ? chapterEntries.find(chapter => chapter.chapterId === parts.explicitChapterId) || chapterEntries[0]
        : chapterEntries[0];

      const chess = new Chess();
      const mainlinePgn = stripVariationsAndComments(selected.pgn);
      chess.loadPgn(mainlinePgn, { strict: false });
      const thumbnailFen = chess.fen();
      const startFen = selected.headers.FEN || new Chess().fen();
      const hash = fenHash(thumbnailFen);
      const thumbnailPath = `${THUMB_DIR}/${parts.studyId}-${selected.chapterId || 'chapter1'}-${hash}.svg`.replace(/\\/g, '/');

      await fs.writeFile(thumbnailPath, renderBoardSvg({
        fen: thumbnailFen,
        title: study.title,
        orientation: selected.orientation,
        pieceSymbolDefs,
      }), 'utf8');

      generated.studies[parts.studyId] = {
        studyId: parts.studyId,
        sourceUrl: study.link,
        rowNumber: study.rowNumber,
        title: study.title,
        author: study.author,
        selectedChapterId: selected.chapterId || '',
        selectedChapterName: selected.chapterName,
        selectedChapterIndex: selected.chapterIndex,
        chapterIds: chapterEntries.map(chapter => chapter.chapterId).filter(Boolean),
        chapterNames: chapterEntries.map(chapter => chapter.chapterName),
        startFen,
        thumbnailFen,
        orientation: selected.orientation,
        intro: previous?.intro || '',
        searchText: [
          study.title,
          study.author,
          study.category,
          study.side,
          study.difficulty,
          study.notes,
          study.viewerNote,
          selected.chapterName,
          chapterEntries.map(chapter => chapter.chapterName).join(' '),
        ].filter(Boolean).join(' '),
        thumbnailPath,
        thumbnailSource: 'lichess-final-mainline',
        renderer: THUMBNAIL_RENDERER_ID,
        pgnFetched: true,
        pgnLength: pgn.length,
        error: '',
        lichessLastModified: lastModified,
        updatedAt: new Date().toISOString(),
      };

      processedStudyIds.add(parts.studyId);
      processed++;
      console.log(`ok ${parts.studyId} ${selected.chapterId || 'chapter1'} ${thumbnailFen}`);
    } catch (error) {
      failures.push({ studyId: parts.studyId, title: study.title, error: error.message });
      generated.studies[parts.studyId] = {
        ...(previous || {}),
        studyId: parts.studyId,
        sourceUrl: study.link,
        rowNumber: study.rowNumber,
        title: study.title,
        author: study.author,
        pgnFetched: previous?.thumbnailPath ? previous.pgnFetched : false,
        error: error.message,
        updatedAt: new Date().toISOString(),
      };
      console.warn(`fail ${parts.studyId} ${error.message}`);
    }
  }

  generated.generatedAt = new Date().toISOString();
  generated.summary = {
    processed,
    failures: failures.length,
    successfulThumbnails: Object.values(generated.studies).filter(study => study.thumbnailPath).length,
    totalGeneratedStudies: Object.keys(generated.studies).length,
  };

  await fs.writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(generated.summary, null, 2));
  if (failures.length) {
    console.log('Failures:');
    for (const failure of failures) console.log(`- ${failure.studyId}: ${failure.error}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
