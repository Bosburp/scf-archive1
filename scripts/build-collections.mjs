import fs from 'node:fs/promises';
import vm from 'node:vm';
import { libraryContext, fetchLibrary } from './lib/library-context.mjs';

const context = await libraryContext();
const studies = await fetchLibrary(context);
const collections = vm.runInContext('STUDY_COLLECTIONS', context);
const template = await fs.readFile('index.html', 'utf8');
const origin = 'https://chessstudylibrary.vercel.app';
const escape = context.escapeHTML;
const ids = new Set(studies.map(study => context.collectionStudyId(study.link)));
for (const collection of collections) {
    for (const entry of collection.groups.flatMap(group => group.entries)) {
        if (!ids.has(context.collectionStudyId(entry.link))) throw new Error(`Study missing from Sheet: ${entry.link}`);
    }
}

for (const collection of [null, ...collections]) {
    const slug = collection?.slug || '';
    const route = `/collections/${slug ? slug + '/' : ''}`;
    const title = collection?.title || 'Study Collections';
    const description = collection?.description || 'Explore curated chess study collections, including rook endgames and Bosburp\'s White opening repertoire recommendations. Free community studies on Lichess.';
    let html = template.replace('<head>', '<head>\n    <base href="/">')
        .replace('<body class="', '<body class="collections-view ')
        .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)} | Chess Study Library</title>`)
        .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
        .replace(/(<link rel="canonical" href=")[^"]*/, `$1${origin}${route}`)
        .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, `$1${escape(title)} | Chess Study Library`)
        .replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g, `$1${escape(description)}`)
        .replace(/(<meta property="og:url" content=")[^"]*/, `$1${origin}${route}`)
        .replace(/<h1 class="brand-title([^>]*)>(.*?)<\/h1>/, '<p class="brand-title$1>$2</p>')
        .replace('<a href="/" aria-current="page">Library</a>', '<a href="/">Library</a>')
        .replace('<a href="/collections/">Collections</a>', '<a href="/collections/" aria-current="page">Collections</a>')
        .replace('<button type="button" onclick="showCommunityLibrary()">Community Library</button>', '<a href="/">Community Library</a>')
        .replace('<button type="button" onclick="jumpToNewStudies()">Latest Studies</button>', '<a href="/#latestSection">Latest Studies</a>');
    if (collection?.cover) {
        html = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*/g, `$1${origin}/${collection.cover}`)
            .replace('name="twitter:card" content="summary"', 'name="twitter:card" content="summary_large_image"');
    }
    const structured = {
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: title,
        url: origin + route, description,
        isPartOf: { '@type': 'WebSite', name: 'Chess Study Library', url: origin + '/' },
        mainEntity: { '@type': 'ItemList', itemListElement: collection
            ? collection.groups.flatMap(group => group.entries).map((entry, index) => ({ '@type': 'ListItem', position: index + 1, url: entry.link }))
            : collections.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: `${origin}/collections/${item.slug}/` })) }
    };
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>`);
    const start = html.indexOf('        <section id="communityLibraryNote"');
    const end = html.indexOf('        <footer class="site-footer">');
    if (start < 0 || end < start) throw new Error('Library template boundaries changed');
    html = html.slice(0, start)
        + `<main id="collectionsContent" data-collection="${slug}">${context.collectionPageHtml(collection, studies)}</main>\n`
        + '<div hidden>\n' + html.slice(start, end) + '</div>\n' + html.slice(end);
    await fs.mkdir('collections/' + slug, { recursive: true });
    await fs.writeFile(`collections/${slug ? slug + '/' : ''}index.html`, html.replace(/[\t ]+\r?$/gm, ''));
    console.log(`${route}: ${collection ? context.collectionEntryCount(collection) + ' studies' : collections.length + ' collections'}`);
}

const sitemap = await fs.readFile('sitemap.xml', 'utf8');
const withoutCollections = sitemap.replace(/\s*<url>\s*<loc>https:\/\/chessstudylibrary\.vercel\.app\/collections\/[\s\S]*?<\/url>/g, '');
const entries = ['', ...collections.map(item => item.slug + '/')].map(slug => `  <url><loc>${origin}/collections/${slug}</loc></url>`).join('\n');
await fs.writeFile('sitemap.xml', withoutCollections.replace('</urlset>', `${entries}\n</urlset>`));
