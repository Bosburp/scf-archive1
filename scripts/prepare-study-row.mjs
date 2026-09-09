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
  const selectedGame = games.find(game => parts.explicitChapterId && game.includes(parts.explicitChapterId)) || games[0] || pgn;
  const headers = selectedGame ? parseHeaders(selectedGame) : {};

  const title = (args.title || headers.StudyName || headers.Event || '').trim();
  const author = cleanAuthor(args.author || headers.Annotator || headers.White || headers.Black || '');
  const category = args.category || '';
  const side = args.side || headers.Orientation || 'Universal';
  const description = args.description || args.notes || '';
  const tags = args.tags || '';
  const createdAt = new Date().toISOString().slice(0, 10);

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
    selectedChapterTitle: headers.ChapterName || headers.Event || '',
    title,
    author,
    url: parts.canonicalUrl,
    exportWarning,
  };

  console.log(JSON.stringify({ derived, row }, null, 2));
  console.log('\nCSV row:');
  console.log(SHEET_COLUMNS.map(column => csvCell(row[column])).join(','));
}

main().catch(error => {
  console.error(`prepare-study-row failed: ${error.message}`);
  process.exit(1);
});
