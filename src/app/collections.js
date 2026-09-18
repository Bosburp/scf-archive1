function collectionStudyId(link) {
    return link.match(/lichess\.org\/study\/([a-zA-Z0-9]{8})/)?.[1];
}

function studyDetailsLink(link) {
    const id = collectionStudyId(link);
    const selected = STUDY_COLLECTIONS.find(item => item.slug === 'rook-endgames');
    return selected?.groups.some(group => group.entries.some(entry => collectionStudyId(entry.link) === id))
        ? `<a class="study-details-link" href="/studies/${id}/">Study details</a>` : '';
}

function collectionEntryCount(collection) {
    return collection.groups.reduce((count, group) => count + group.entries.length, 0);
}

function collectionEntriesHtml(collection, studies) {
    const byId = new Map(studies.map(study => [collectionStudyId(study.link), study]));
    return collection.groups.map((group, index) => `
        <section class="collection-group" id="collection-group-${index + 1}">
            <h2>${escapeHTML(group.title)}</h2>
            <div class="collection-study-grid">${group.entries.map(entry => {
                const study = byId.get(collectionStudyId(entry.link));
                const card = study
                    ? cardHtml({ ...study, link: entry.link, favoriteLink: study.link }, new Set())
                    : `<div class="collection-missing"><a href="${escapeHTML(entry.link)}" target="_blank" rel="noopener noreferrer">${escapeHTML(entry.label || 'Open selected study on Lichess')} &rarr;</a><p>Library details are currently unavailable.</p></div>`;
                return `<article class="collection-entry">
                    <div class="collection-curator-note">
                        ${entry.label ? `<h3>${escapeHTML(entry.label)}</h3>` : ''}
                        ${entry.level ? `<p class="collection-level">${escapeHTML(entry.level)}</p>` : ''}
                        <p>${escapeHTML(entry.note)}</p>
                    </div>${card}
                </article>`;
            }).join('')}</div>
        </section>`).join('');
}

function collectionPageHtml(collection, studies) {
    if (!collection) {
        return `<header class="collection-intro"><h1>Study Collections</h1>
            <p>Selected studies, a clear starting point, and guidance from the curator. Explore a topic or build a repertoire with community-created studies hosted on Lichess.</p></header>
            <div class="collection-overview">${STUDY_COLLECTIONS.map(item => {
                const first = item.groups[0].entries[0];
                const study = studies.find(s => collectionStudyId(s.link) === collectionStudyId(first.link));
                const cover = item.cover || study?.image;
                return `<a class="collection-summary" href="/collections/${item.slug}/">
                    ${cover ? `<img src="${escapeHTML(cover)}" alt="${escapeHTML(item.coverAlt || '')}" width="1280" height="720" loading="lazy">` : ''}
                    <div><p class="collection-level">${collectionEntryCount(item)} studies &middot; Curated by ${escapeHTML(item.curator)}</p>
                    <h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description)}</p><span class="gold-accent">Explore collection &rarr;</span></div></a>`;
            }).join('')}</div>`;
    }
    return `<header class="collection-intro">
        <a href="/collections/" class="gold-accent">&larr; All collections</a>
        <h1>${escapeHTML(collection.title)}</h1>
        <p class="collection-level">${collectionEntryCount(collection)} studies &middot; Curated by <a href="/?author=${encodeURIComponent(collection.curator)}">${escapeHTML(collection.curator)}</a></p>
        <p>${escapeHTML(collection.introduction)}</p><p class="collection-guidance">${escapeHTML(collection.guidance)}</p>
        <p class="collection-guidance">Original studies belong to their credited creators and open on Lichess.</p>
        ${collection.groups.length > 1 ? `<nav class="collection-jump-links" aria-label="Collection sections">${collection.groups.map((group, index) => `<a href="/collections/${collection.slug}/#collection-group-${index + 1}">${escapeHTML(group.title)}</a>`).join('')}</nav>` : ''}
        </header>${collectionEntriesHtml(collection, studies)}`;
}

function renderStudyCollections() {
    const root = document.getElementById('collectionsContent') || document.getElementById('communityContent');
    if (!root || !window.chessData?.length) return;
    if (root.id === 'collectionsContent') {
        const collection = STUDY_COLLECTIONS.find(item => item.slug === root.dataset.collection);
        root.innerHTML = collectionPageHtml(collection, window.chessData);
    }
    const favorites = getFavorites();
    root.querySelectorAll('.fav-btn').forEach(button => {
        const link = button.dataset.favoriteLink;
        button.classList.toggle('active', favorites.has(link));
    });
}
