import fs from 'node:fs/promises';
import vm from 'node:vm';
import { libraryContext, fetchLibrary } from './lib/library-context.mjs';

const origin = 'https://chessstudylibrary.vercel.app';
const context = await libraryContext();
const studies = await fetchLibrary(context);
const collections = vm.runInContext('STUDY_COLLECTIONS', context);
const rook = collections.find(item => item.slug === 'rook-endgames');
const escape = context.escapeHTML;
// The generated collection shell already preserves shared controls and root links.
const template = await fs.readFile('collections/index.html', 'utf8');
const team = 'https://lichess.org/team/study-creators--friends';
const discord = 'https://discord.gg/sD7sCvyHMa';
const external = (url, label) => `<a class="gold-accent" href="${url}" target="_blank" rel="noopener noreferrer">${label} &rarr;</a>`;
const schedule = [
    ['00:00', 'SCF Americas Swiss', '5+0', 7],
    ['04:00', 'SCF Asia-Pacific Swiss', '3+2', 7],
    ['09:00', 'SCF Global Morning Swiss', '5+0', 7],
    ['14:00', 'SCF Global Rapid Swiss', '10+0', 5],
    ['19:00', 'SCF Prime Swiss', '3+2', 9]
];
const pages = [
    {
        route: '/tournaments/', title: 'SCF Daily Swiss Tournaments',
        description: 'The Study Creators & Friends daily Swiss schedule: five rated standard chess tournaments, UTC start times, time controls and rounds. Join through the SCF Lichess team.',
        content: `<section><h2>Five opportunities to play each day</h2><p>Put your study into practice with the SCF community. Our regular Swiss tournaments are rated standard chess and are restricted to Study Creators &amp; Friends team members.</p>
            <table class="scf-schedule"><caption>Regular daily schedule. All start times are UTC.</caption><thead><tr><th scope="col">UTC</th><th scope="col">Tournament</th><th scope="col">Time control</th><th scope="col">Rounds</th></tr></thead>
            <tbody>${schedule.map(([time, name, control, rounds]) => `<tr><th scope="row">${time}</th><td>${name}</td><td>${control}</td><td>${rounds}</td></tr>`).join('')}</tbody></table>
            <p>Time controls show minutes per player plus the increment in seconds per move. For example, 3+2 means three minutes plus two seconds after each move.</p>
            <h2>Find and join a tournament</h2><p>Our automated system creates tournaments 48 hours before their scheduled start. Check the team page for the actual event links and current availability; this page shows the regular schedule, not live event status.</p>
            <p>${external(team, 'View the SCF Lichess team')}</p><p>Join the team, choose an upcoming Swiss, and register on Lichess. Questions about an event? ${external(discord, 'Ask in Discord')}</p>
            <h2>Between rounds</h2><p>Browse the <a class="gold-accent" href="/">Study Library</a> or work through a <a class="gold-accent" href="/collections/">curated collection</a> before your next game.</p></section>`
    },
    {
        route: '/about/', title: 'Study Creators & Friends',
        description: 'Meet Study Creators & Friends: a chess community sharing free educational studies, personal recommendations and daily Swiss tournaments on Lichess.',
        content: `<section><h2>A community for learning, creating and sharing</h2><p>We bring together people who make chess studies and people who enjoy learning from them. Good explanations and thoughtful analysis deserve to be easier to find.</p>
            <h2>Why a study library?</h2><p>There is a great deal of educational material on Lichess, but finding a useful study can take time. SCF organizes community studies by topic and credits the people who created them. Our collections add a personal starting point: what to try, how the selections fit together, and why a curator recommends them.</p>
            <p>Creators make the studies. Lichess hosts them. SCF helps you discover them. The library is free, and the original work remains with its creators on Lichess. SCF is a community using Lichess, not the operator of Lichess.</p>
            <h2>Take part</h2><ul><li>Find something to learn in the <a class="gold-accent" href="/">Study Library</a>.</li><li>Explore <a class="gold-accent" href="/collections/">curator-selected collections</a>.</li><li>Play with the community in our <a class="gold-accent" href="/tournaments/">daily Swiss tournaments</a>.</li><li>Share a study for review through the study-submissions channel in Discord.</li></ul>
            <nav class="scf-discovery-links" aria-label="Join SCF">${external(team, 'Join on Lichess')}${external(discord, 'Join Discord')}</nav>
            <h2>Respect for creators</h2><p>Study cards identify the original authors and open their work directly on Lichess. Curation is not a claim of ownership. If you have a question about a listing or attribution, contact us through Discord.</p></section>`
    }
];

// Original practice suggestions, not claims about inaccessible chapter contents.
const practice = {
    bnboDhFM: ['Work through the core positions', 'Use Bosburp\'s suggested order: Philidor and Lucena first, then Vancura and the exercises. For each position, explain what the defending rook is trying to prevent before looking at the continuation.', 'Play the position from both sides. Once you understand the idea, try it again without the notes and compare your decisions with the study.'],
    '7UUxD0rK': ['Compare plans, not just moves', 'Use this as a companion to the first selection in the rook-endgame collection. Before reading a line, identify the active rook, the role of each king, and which pawns can become targets.', 'Write down a candidate move and the reply you expect. Then check the study and revisit any position where your plan differs. This is a practice suggestion, not a claim that every chapter contains the same themes.'],
    wyDD6Zrb: ['Practise the defence as well as the attack', 'This selection focuses on rook and bishop versus rook, a step beyond basic rook-and-pawn endings. Start at the recommended chapter and distinguish positions where the stronger side can make progress from those where the defender can hold.', 'Try each position from both sides. Track how king placement and rook activity change the plan, and use the study annotations to check your reasoning rather than assuming that the extra bishop guarantees a win.']
};
for (const entry of rook.groups.flatMap(group => group.entries)) {
    const id = context.collectionStudyId(entry.link);
    const study = studies.find(item => context.collectionStudyId(item.link) === id);
    if (!study) throw new Error(`Missing Sheet study ${id}`);
    const [heading, first, second] = practice[id];
    const card = context.cardHtml({ ...study, link: entry.link, favoriteLink: study.link }, new Set())
        .replace(/<a class="study-details-link"[^>]*>Study details<\/a>/, '');
    pages.push({ route: `/studies/${id}/`, title: study.title,
        description: `${study.title}: creator attribution, Bosburp's recommendation and a practical study approach. Open the original study on Lichess.`,
        content: `<div class="scf-detail-layout"><div>${card}</div><section><h2>Why it is in the collection</h2><p class="collection-level">Selected by Bosburp</p><p>${escape(entry.note)}</p><h2>${escape(heading)}</h2><p>${escape(first)}</p><p>${escape(second)}</p><p>These are SCF practice suggestions. The original analysis and annotations belong to the credited study creators and are available on Lichess.</p><p><a class="gold-accent" href="/collections/rook-endgames/">Explore the full rook-endgame collection &rarr;</a></p><p><a class="gold-accent" href="/?category=Endgames">Browse endgame studies &rarr;</a></p></section></div>` });
}

for (const page of pages) {
    const navRoute = page.route.startsWith('/studies/') ? '/' : page.route;
    const schema = { '@context': 'https://schema.org', '@type': page.route === '/about/' ? 'AboutPage' : 'WebPage',
        name: page.title, description: page.description, url: origin + page.route,
        isPartOf: { '@type': 'WebSite', name: 'Chess Study Library', url: origin + '/' } };
    let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)} | Chess Study Library</title>`)
        .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*/g, `$1${escape(page.description)}`)
        .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, `$1${escape(page.title)} | Chess Study Library`)
        .replace(/(<link rel="canonical" href=")[^"]*/, `$1${origin}${page.route}`)
        .replace(/(<meta property="og:url" content=")[^"]*/, `$1${origin}${page.route}`)
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
        .replace(/<main id="collectionsContent"[\s\S]*?<\/main>/, `<main id="communityContent" class="scf-page"><header class="collection-intro"><h1>${escape(page.title)}</h1></header>${page.content}</main>`)
        .replace('href="/collections/" aria-current="page"', 'href="/collections/"')
        .replace(`<a href="${navRoute}">`, `<a href="${navRoute}" aria-current="page">`);
    if (html.includes('id="collectionsContent"') || !html.includes('id="communityContent"')) throw new Error('Community template boundary changed');
    await fs.mkdir('.' + page.route, { recursive: true });
    await fs.writeFile('.' + page.route + 'index.html', html.replace(/[\t ]+\r?$/gm, ''));
    console.log(page.route);
}
// Only actual canonical pages belong in the sitemap, not filtered copies of `/`.
const routes = ['/', '/collections/', ...collections.map(item => `/collections/${item.slug}/`), ...pages.map(page => page.route)];
await fs.writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n')}\n</urlset>\n`);
