import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { libraryContext } from './lib/library-context.mjs';

const context = await libraryContext();
const taxonomy = (title, category, extra = {}) => context.deriveOpeningTaxonomy({ title, category, ...extra });
assert.equal(taxonomy('Two Knights Attack | vs Caro-Kann', 'Caro-Kann Defense').opening, 'Caro-Kann Defense');
assert.equal(taxonomy('Two Knights Attack | vs Caro-Kann', '1.e4 e5 Openings').opening, 'Caro-Kann Defense');
assert.equal(taxonomy('Two Knights Variation | vs French Defense', '1.e4 e6 Openings').opening, 'French Defense');
assert.equal(taxonomy('Two Knights Defense', '1.e4 e5 Openings').opening, "King's Pawn Opening");
assert.notEqual(taxonomy('Two Knights Attack', 'Miscellaneous Openings').opening, "King's Pawn Opening");
assert.equal(taxonomy('Scotch Gambit', '1.e4 e5 Openings').specificOpening, 'Scotch Game');
assert.equal(taxonomy('Italian Game', '1.e4 e5 Openings').specificOpening, 'Italian Game');
assert.equal(taxonomy('Sicilian Najdorf', '1.e4 c5 Openings').specificOpening, 'Najdorf');
assert.equal(taxonomy('Rook + Bishop vs Rook', 'Endgame', { generated: { selectedChapterName: 'Philidor technique' } }).categoryGroup, 'Endgames');
assert.equal(taxonomy('Strategy in the Sicilian', 'Strategy').opening, '');

const collections = vm.runInContext('STUDY_COLLECTIONS', context);
assert.deepEqual(Array.from(collections, c => context.collectionEntryCount(c)), [3, 30, 26]);
const black = collections.find(c => c.slug === 'bosburp-black-repertoire');
const suppliedBlackLinks = ['spty8Dc9', 'Fmk4fYJp', 'oWZx54ef', '8isfzJc8', 'dJQzdsfb', 'bZOUIzL2', 'artxS9bL', 'd8vKHXnC', 'lmE5iSRC', 'WV5BQOvt', '8mtnMdsO', 'NutHq1Cx/6Eq6oANy', 'sJVldGJL/E9Q9PBpz', '9XAhbaE7', 'hEPV1nVh', 'gxTkmYQU', 'PV67RqMx', 'bsLwjNBX', 'HwcpcnXo/3BIeAqfg', '0hjkNe91', '8l7u1jBt', 'HlS091Xs', 'V7l41WdC/IF4omPHp', 'm2ovNEWF/w4XIK8sf', 'qpTWyTks', 'P7O9jus3/JJMzE5Jl'];
assert.deepEqual(Array.from(black.groups.flatMap(g => g.entries), e => e.link), suppliedBlackLinks.map(id => 'https://lichess.org/study/' + id));
const sitemap = await fs.readFile('sitemap.xml', 'utf8');
for (const collection of [null, ...collections]) {
    const route = `/collections/${collection ? collection.slug + '/' : ''}`;
    const html = await fs.readFile('.' + route + 'index.html', 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route + ': one main heading');
    assert(html.includes(`<link rel="canonical" href="https://chessstudylibrary.vercel.app${route}">`));
    assert(html.includes('<base href="/">'));
    assert(sitemap.includes(`<loc>https://chessstudylibrary.vercel.app${route}</loc>`));
    assert(!html.includes('collection-missing'));
    assert(!html.includes('noindex'));
    JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    for (const src of [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+)"/g)].map(m => m[1])) await fs.access(src);
    if (!collection) continue;
    const links = new Set();
    for (const entry of collection.groups.flatMap(g => g.entries)) {
        assert(!links.has(entry.link), 'Duplicate selection: ' + entry.link);
        links.add(entry.link);
        assert(html.includes(`href="${entry.link}" target="_blank" rel="noopener noreferrer"`), 'Exact chapter link missing: ' + entry.link);
        assert(html.includes(context.escapeHTML(entry.note)));
    }
    assert.equal((html.match(/class="collection-entry"/g) || []).length, context.collectionEntryCount(collection));
}
console.log('Collections: all 59 selections, chapter links, static content, assets, SEO and taxonomy regression checks passed.');
