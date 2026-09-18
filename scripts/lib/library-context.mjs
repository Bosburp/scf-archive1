import fs from 'node:fs/promises';
import vm from 'node:vm';

// Reuse the browser's parser, taxonomy and card renderer for static collection pages.
// Event handlers are registered but never invoked; network/startup runs separately.
export async function libraryContext() {
    const source = await fs.readFile('src/app/app.js', 'utf8');
    const startup = source.lastIndexOf('\napplyStoredTheme();');
    if (startup < 0) throw new Error('Library startup boundary changed');
    const context = vm.createContext({
        console, URL, URLSearchParams, Set,
        window: { addEventListener() {} },
        document: { addEventListener() {}, getElementById() { return { addEventListener() {} }; } },
        localStorage: { getItem() { return null; } },
        IntersectionObserver: class { observe() {} }
    });
    vm.runInContext(source.slice(0, startup), context);
    context.window.generatedStudyData = JSON.parse(await fs.readFile('generated/lichess-study-data.json', 'utf8'));
    vm.runInContext(await fs.readFile('src/data/collections.js', 'utf8'), context);
    vm.runInContext(await fs.readFile('src/app/collections.js', 'utf8'), context);
    return context;
}

export async function fetchLibrary(context) {
    const url = vm.runInContext('sheetUrl', context);
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`Sheet read failed: ${response.status}`);
    const csv = await response.text();
    if (!csv.includes('Lichess')) throw new Error('Unexpected Sheet response');
    context.window.chessData = context.parseStudyRows(csv);
    return context.window.chessData;
}
