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

try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?titled=1');await page.waitForFunction(()=>window.chessData?.length>250);
 assert.equal(await page.locator('#titledSelect').inputValue(),'Yes');
 const count=await page.evaluate(()=>getCompatibleStudies().length);assert(count>0);
 assert(await page.evaluate(()=>getCompatibleStudies().every(isTitledStudy)));
 assert(await page.evaluate(()=>isTitledStudy({authors:['Unknown','Kpio91']})));
 assert.equal(await page.evaluate(()=>isTitledStudy({authors:['GM Unverified']})),false);
 await page.selectOption('#staffSelect','Yes');
 assert(await page.evaluate(()=>getCompatibleStudies().every(s=>isTitledStudy(s)&&isStaffPickStudy(s))));
 await page.reload();await page.waitForFunction(()=>window.chessData?.length>250);
 assert.equal(await page.locator('#titledSelect').inputValue(),'Yes');
 await page.locator('[aria-label="Clear Players"]').click();
 assert.equal(await page.locator('#titledSelect').inputValue(),'Any');
 assert(!new URL(page.url()).searchParams.has('titled'));
 await page.selectOption('#titledSelect','Yes');await page.evaluate(()=>resetFilters());
 assert.equal(await page.locator('#titledSelect').inputValue(),'Any');
 assert.deepEqual(errors,[]);console.log('Titled filter: '+count+' studies; URL, combined filters, coauthors, unknown titles and reset passed.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
