import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer(async (request, response) => {
    try {
        let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        if (pathname.endsWith('/')) pathname += 'index.html';
        const file = path.resolve(root, '.' + pathname);
        if (!file.startsWith(root + path.sep)) throw new Error('Outside root');
        response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        response.end(await fs.readFile(file));
    } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.QA_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'node_modules/.cache/collections-qa';
await fs.mkdir(output, { recursive: true });
try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/collections/rook-endgames/');
    await page.waitForFunction(() => window.chessData?.length > 250, { timeout: 60000 });
    assert.equal(await page.locator('.collection-entry').count(), 3);
    assert.equal(await page.locator('#libraryControls').isVisible(), false);
    assert.equal(await page.locator('h1:visible').count(), 1);
    assert.equal(await page.locator('.collection-entry .card-author').count(), 3);
    assert(await page.locator('body').evaluate(el => el.classList.contains('light-mode')), 'New visitors start in light mode');
    await page.locator('#themeToggle').click();
    await page.reload();
    await page.waitForFunction(() => window.chessData?.length > 250);
    assert(await page.locator('body').evaluate(el => !el.classList.contains('light-mode')), 'Saved dark preference survives reload');
    await page.screenshot({ path: output + '/rook-dark.png', fullPage: true });
    await page.locator('#themeToggle').click();
    await page.screenshot({ path: output + '/rook-light.png', fullPage: true });
    const expected = 'https://lichess.org/study/7UUxD0rK/hNYicO4r';
    await context.route('https://lichess.org/study/**', route => route.fulfill({ body: '<title>Study destination</title>', contentType: 'text/html' }));
    const popupPromise = context.waitForEvent('page');
    await page.locator('.collection-entry .card-title').nth(1).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(popup.url(), expected);
    await popup.close();
    await page.locator('.collection-entry .fav-btn').first().click();
    assert(await page.locator('.collection-entry .fav-btn').first().evaluate(el => el.classList.contains('active')));
    await page.reload();
    await page.waitForFunction(() => window.chessData?.length > 250);
    assert(await page.locator('.collection-entry .fav-btn').first().evaluate(el => el.classList.contains('active')));
    await page.locator('.collection-entry .card-author-link').first().click();
    await page.waitForURL('**/?author=NoseKnowsAll');
    await page.locator('#authorProfileSection').waitFor({ state: 'visible' });
    await page.goto(base + '/?category=Openings&opening=Caro-Kann%20Defense');
    await page.waitForFunction(() => window.chessData?.length > 250);
    assert.equal(await page.locator('#openingSelect').inputValue(), 'Caro-Kann Defense');
    await page.locator('#searchInput').fill('Two Knights');
    await page.waitForTimeout(500);
    assert(await page.locator('#resultsGrid .card-title[href*="64DHMYix"]').isVisible());
    assert(await page.evaluate(() => [...document.querySelectorAll('#resultsGrid .card-title')].every(link =>
        window.chessData.find(study => study.link === link.href)?.opening === 'Caro-Kann Defense')));
    await page.goto(base + '/?view=endgames');
    await page.locator('#endgameTrainerSection').waitFor({ state: 'visible' });
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ['/tournaments/', '/about/', '/studies/bnboDhFM/', '/studies/7UUxD0rK/', '/studies/wyDD6Zrb/']) {
            await page.goto(base + route);
            await page.waitForFunction(() => window.chessData?.length > 250);
            assert.equal(await page.locator('h1:visible').count(), 1);
            assert.equal(await page.locator('#libraryControls').isVisible(), false);
            assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://chessstudylibrary.vercel.app' + route);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${width} ${route}`);
            if (route === '/tournaments/') {
                assert.equal(await page.locator('.scf-schedule tbody tr').count(), 5);
                assert(await page.locator('.scf-schedule').innerText().then(text => text.includes('19:00')));
            }
            if (route.includes('/studies/')) {
                const img = page.locator('#communityContent .card-image');
                await img.scrollIntoViewIfNeeded();
                await img.evaluate(el => el.decode());
                assert(await img.evaluate(el => el.naturalWidth > 0));
                if (route.includes('7UUxD0rK')) assert.equal(await page.locator('#communityContent .card-title').getAttribute('href'), expected);
            }
            for (const mode of ['light', 'dark']) {
                await page.evaluate(light => { document.body.classList.toggle('light-mode', light); }, mode === 'light');
                await page.screenshot({ path: `${output}/scf-${route.split('/').filter(Boolean).join('-')}-${width}-${mode}.png`, fullPage: true });
            }
        }
    }
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ['/collections/', '/collections/bosburp-opening-repertoire/', '/collections/bosburp-black-repertoire/']) {
            await page.goto(base + route);
            await page.waitForFunction(() => window.chessData?.length > 250);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width} ${route}`);
            if (route.includes('bosburp')) assert.equal(await page.locator('.collection-entry').count(), route.includes('black') ? 26 : 30);
            await page.screenshot({ path: `${output}/${route.includes('black') ? 'black' : route.includes('bosburp') ? 'openings' : 'index'}-${width}.png`, fullPage: false });
        }
    }
    assert.deepEqual(errors, []);
    await context.close();
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base + '/collections/rook-endgames/');
    assert.equal(await staticPage.locator('.collection-entry').count(), 3);
    assert(await staticPage.locator('h1').isVisible());
    assert.equal(await staticPage.locator('.collection-entry .card-title').nth(1).getAttribute('href'), expected);
    for (const route of ['/tournaments/', '/about/', '/studies/7UUxD0rK/']) {
        await staticPage.goto(base + route);
        assert(await staticPage.locator('#communityContent h1').isVisible());
        assert(await staticPage.locator('#communityContent').innerText().then(text => text.length > 300));
    }
    await noJs.close();
    console.log('Browser QA passed: desktop/tablet/mobile, themes, 59 cards, new-tab chapter links, favorites, authors, search/filter, trainer, no-JS content, no page errors.');
    console.log('Screenshots: ' + output);
} finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
}
