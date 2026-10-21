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

const output='.local/site-review';await fs.mkdir(output,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.waitForFunction(()=>window.chessData?.length>250);
 assert.equal(await page.locator('#activeFilters').isVisible(),false);
 assert(!await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('cdn.tailwindcss.com'))));
 const button=page.locator('.header-actions button');await button.click();await page.locator('#submitPage').waitFor({state:'visible'});
 assert(await page.evaluate(()=>document.querySelector('#submitPage').contains(document.activeElement)));
 await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.querySelector('#submitPage').contains(document.activeElement)));
 await page.keyboard.press('Escape');assert(await button.evaluate(el=>document.activeElement===el));
 await page.keyboard.press('/');assert(await page.locator('#searchInput').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Escape');await page.locator('#searchInput').blur();
 for(const width of [1440,768,390,320]) {
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Overflow at '+width);
  if(width<=640){
   assert.equal(await page.locator('#filterGrid').isVisible(),false);
   await page.locator('#mobileFilterToggle').click();assert(await page.locator('#filterGrid').isVisible());
   await page.selectOption('#titledSelect','Yes');assert(await page.evaluate(()=>getCompatibleStudies().every(isTitledStudy)));
   await page.locator('#mobileFilterToggle').click();assert(await page.locator('#activeFilters').isVisible());
   await page.evaluate(()=>resetFilters());
  }
 }
 await page.setViewportSize({width:390,height:900});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:output+'/mobile.png'});
 await page.locator('#themeToggle').click();await page.screenshot({path:output+'/mobile-dark.png'});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:output+'/desktop-dark.png'});
 await page.locator('#themeToggle').click();await page.screenshot({path:output+'/desktop.png'});
 await page.locator('#resultsGrid').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/cards.png'});
 for(const route of ['/collections/','/about/','/tournaments/','/studies/bnboDhFM/']) {
  await page.goto(base+route);await page.waitForFunction(()=>window.chessData?.length>250);
  assert.equal(await page.locator('h1:visible').count(),1);
  const skipTarget=await page.locator('.skip-link').getAttribute('href');assert(await page.locator(new URL(skipTarget, base).hash).isVisible());
  await page.screenshot({path:output+'/'+route.split('/')[1]+'.png'});
  await page.setViewportSize({width:390,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow');
  await page.setViewportSize({width:1440,height:1000});
 }
 assert.deepEqual(errors,[]);console.log('Site refinement QA passed: keyboard/dialog focus, mobile filters, responsive pages, dark mode, no runtime CSS compiler.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
