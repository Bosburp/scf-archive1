import fs from 'node:fs/promises';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const index = await fs.readFile('index.html', 'utf8');
const robots = await fs.readFile('robots.txt', 'utf8');
const sitemap = await fs.readFile('sitemap.xml', 'utf8');
const app = await fs.readFile('src/app/app.js', 'utf8');
const endgame = await fs.readFile('src/app/endgame-trainer.js', 'utf8');
const generated = JSON.parse(await fs.readFile('generated/lichess-study-data.json', 'utf8'));

assert(index.includes('<html lang="en">'), 'Missing lang=en');
assert(index.includes('<meta name="robots" content="index,follow">'), 'Missing indexable robots meta');
assert(!/noindex|nofollow/i.test(index.replace('<meta name="robots" content="index,follow">', '')), 'Unexpected noindex/nofollow');
assert(index.includes('<link rel="canonical" href="https://chessstudylibrary.vercel.app/">'), 'Missing canonical URL');
assert(index.includes('property="og:title"'), 'Missing Open Graph title');
assert(index.includes('name="twitter:title"'), 'Missing Twitter metadata');
assert(index.includes('application/ld+json'), 'Missing structured data');
assert(index.includes('assets/brand/csl-mark.svg'), 'Missing favicon/brand mark reference');
assert((index.match(/<h1\b/g) || []).length === 1, 'Expected exactly one h1');
assert(index.includes('Hosted by Study Creators & Friends'), 'Missing SCF hosting attribution');
assert(index.includes('id="themeToggle"'), 'Missing theme toggle');
assert(index.includes('id="surpriseBtn"'), 'Missing random study button');
assert(index.includes('discord.gg/sD7sCvyHMa'), 'Missing Discord link');
assert(index.includes('lichess.org/team/study-creators--friends'), 'Missing Lichess team link');
assert(index.includes('site-footer'), 'Missing footer');
assert(index.includes('endgameTrainerSection'), 'Missing Endgame Trainer shell');
assert(!index.includes('Continue Browsing'), 'Continue Browsing section should remain removed');

assert(robots.includes('Allow: /'), 'robots.txt should allow crawling');
assert(robots.includes('Sitemap: https://chessstudylibrary.vercel.app/sitemap.xml'), 'robots.txt missing sitemap');
assert(!/Disallow:\s*\//i.test(robots), 'robots.txt blocks site');
assert(sitemap.includes('<urlset'), 'Invalid sitemap');
assert(sitemap.includes('?staff=1'), 'Sitemap staff-pick URL should use staff=1');
assert(!sitemap.includes('?staff=Yes'), 'Sitemap contains stale staff=Yes URL');
assert(sitemap.includes('variation=Italian%20Game'), 'Sitemap missing supported Italian Game variation URL');
assert(sitemap.includes('variation=Najdorf'), 'Sitemap missing supported Najdorf variation URL');

assert(app.includes('thumbnailSource'), 'App should distinguish thumbnail sources');
assert(app.includes('screenshot-fen-reference'), 'App should use verified screenshot-FEN references');
assert(app.includes('study-generated'), 'App should prioritize reliable study-FEN thumbnails');
assert(app.includes('screenshot-generated'), 'App should label screenshot-derived generated thumbnails');
assert(app.includes('handleStudyLinkClick'), 'Study link click handler missing');
assert(!app.includes('scrollBy('), 'Unexpected scrollBy hack');
assert(app.includes('currentOpeningFilter'), 'Opening filters missing');
assert(app.includes('currentVariationFilter'), 'Variation filters missing');
assert(app.includes('toggleTheme'), 'Theme logic missing');

assert(endgame.includes('window.showEndgameTrainer'), 'Endgame Trainer route function missing');
assert(endgame.includes('?view=endgames'), 'Endgame Trainer URL route missing');
assert(endgame.includes('Back to Community Library'), 'Endgame Trainer back action missing');

const studies = Object.values(generated.studies || {});
const screenshotRefs = studies.filter(study => study.thumbnailSource === 'screenshot-fen-reference');
const studyFenThumbnails = studies.filter(study => study.thumbnailPath && study.thumbnailFen && study.thumbnailSource !== 'screenshot-fen-reference' && study.thumbnailSource !== 'screenshot-fen-override');
assert(screenshotRefs.length === 18, `Expected 18 verified screenshot-FEN references, found ${screenshotRefs.length}`);
assert(screenshotRefs.every(study => study.thumbnailFen && study.thumbnailPath), 'Verified screenshot references must include FEN and path');
assert(studyFenThumbnails.length >= 120, `Expected restored study-FEN thumbnails, found ${studyFenThumbnails.length}`);

console.log('Static production QA OK');
