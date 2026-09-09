import fs from 'node:fs/promises';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHRh0KZ6s0XfeHMyIFdR-WjWI_t7QOfR8gknJOLZpJlAKkDEWtoDw-RpqHj27TAv17t7xvcfNGqn13/pub?output=csv';
const GENERATED_FILE = 'generated/lichess-study-data.json';

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
      explicitChapterId: parts[2] || '',
    };
  } catch {
    return null;
  }
}

async function readGenerated() {
  try {
    return JSON.parse(await fs.readFile(GENERATED_FILE, 'utf8'));
  } catch {
    return { studies: {} };
  }
}

async function main() {
  const csv = await fetch(SHEET_URL).then(response => {
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status} ${response.statusText}`);
    return response.text();
  });
  const generated = await readGenerated();
  const rows = parseCSV(csv);
  const studies = rows.slice(1).map((c, index) => {
    const link = (c[5] || '').replace(/"/g, '').trim();
    const image = (c[8] || '').replace(/"/g, '').trim();
    const parts = getLichessStudyParts(link);
    const generatedRecord = parts ? generated.studies?.[parts.studyId] : null;
    return {
      rowNumber: index + 2,
      title: (c[3] || '').replace(/"/g, '').trim(),
      author: (c[4] || '').replace(/"/g, '').trim(),
      link,
      image,
      studyId: parts?.studyId || '',
      explicitChapterId: parts?.explicitChapterId || '',
      generatedThumbnailFen: generatedRecord?.thumbnailFen || '',
      generatedThumbnailPath: generatedRecord?.thumbnailPath || '',
      generatedPgnFetched: Boolean(generatedRecord?.pgnFetched),
      generatedError: generatedRecord?.error || '',
    };
  }).filter(study => /^https?:\/\//i.test(study.image));

  const isScreenshotDerived = study => {
    const source = generated.studies?.[study.studyId]?.thumbnailSource || '';
    return source === 'screenshot-fen-reference' || source === 'screenshot-fen-override';
  };
  const hasStudyFenThumbnail = study => {
    const record = generated.studies?.[study.studyId];
    return Boolean(record?.thumbnailPath && record?.thumbnailFen && (record?.pgnFetched || record?.thumbnailSource === 'lichess-final-mainline'));
  };

  const screenshotDerived = studies.filter(isScreenshotDerived);
  const generatedFromStudyFen = studies.filter(study => hasStudyFenThumbnail(study) && !isScreenshotDerived(study));
  const screenshotFallbacks = studies.filter(study => !isScreenshotDerived(study) && !hasStudyFenThumbnail(study));
  const totalGeneratedSelected = generatedFromStudyFen.length + screenshotDerived.length;
  const summary = {
    screenshotRows: studies.length,
    generatedFromStudyFenThumbnails: generatedFromStudyFen.length,
    screenshotDerivedGeneratedThumbnails: screenshotDerived.length,
    totalGeneratedThumbnailsSelected: totalGeneratedSelected,
    screenshotFallbacks: screenshotFallbacks.length,
    screenshotRowsWithUnverifiedScreenshotPositionLeftUntouched: screenshotFallbacks.length,
    couldNotEstablishScreenshotPositionConfidently: screenshotFallbacks.length,
  };

  console.log(JSON.stringify({
    summary,
    generatedFromStudyFen: generatedFromStudyFen.map(study => ({
      rowNumber: study.rowNumber,
      title: study.title,
      studyId: study.studyId,
      image: study.image,
      thumbnailFen: study.generatedThumbnailFen,
      thumbnailPath: study.generatedThumbnailPath,
      source: generated.studies?.[study.studyId]?.thumbnailSource || 'legacy-pgn-fetched',
    })),
    screenshotDerived: screenshotDerived.map(study => ({
      rowNumber: study.rowNumber,
      title: study.title,
      studyId: study.studyId,
      image: study.image,
      thumbnailFen: study.generatedThumbnailFen,
      thumbnailPath: study.generatedThumbnailPath,
      source: generated.studies?.[study.studyId]?.thumbnailSource,
    })),
    screenshotFallbacks: screenshotFallbacks.map(study => ({
      rowNumber: study.rowNumber,
      title: study.title,
      studyId: study.studyId,
      image: study.image,
      generatedPgnFetched: study.generatedPgnFetched,
      generatedError: study.generatedError,
      note: 'No reliable generated FEN or verified screenshot-derived FEN is available. Existing screenshot remains untouched.',
    })),
  }, null, 2));
}

main().catch(error => {
  console.error(`audit-screenshot-thumbnails failed: ${error.message}`);
  process.exit(1);
});
