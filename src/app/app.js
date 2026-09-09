const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHRh0KZ6s0XfeHMyIFdR-WjWI_t7QOfR8gknJOLZpJlAKkDEWtoDw-RpqHj27TAv17t7xvcfNGqn13/pub?output=csv';
const authorSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHRh0KZ6s0XfeHMyIFdR-WjWI_t7QOfR8gknJOLZpJlAKkDEWtoDw-RpqHj27TAv17t7xvcfNGqn13/pub?gid=1246433755&single=true&output=csv';
const FEATURED_KEYWORD = 'FEATURED';
const ITEMS_PER_PAGE = 12;

let currentFilter = 'All',
    currentOpeningFilter = 'All Openings',
    currentVariationFilter = 'All Variations',
    currentSideFilter = 'Any Side',
    currentStaffPickFilter = 'Any',
    currentAuthor = null,
    currentAuthorFilter = 'All Authors',
    currentThemeFilter = 'All Themes',
    currentSubFilter = null,
    currentPage = 1,
    carouselPos = 0,
    carouselInterval,
    pendingUrlPush = false,
    searchTimer;

function isOpeningCategory(category) {
    if (!category) return false;
    const c = category.trim().toLowerCase();
    return /^1\.\S/.test(c) || c.endsWith('defense') || c.includes('opening');
}

const OPENING_TAXONOMY = [
    { opening: 'Sicilian Defense', specificOpening: 'Accelerated Dragon', pattern: /\baccelerated dragon\b|\bhyper[-\s]?accelerated dragon\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Dragon', pattern: /\bdragon\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Najdorf', pattern: /\bnajdorf\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'O\'Kelly', pattern: /\bo['’]?kelly\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Alapin', pattern: /\balapin\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Smith-Morra', pattern: /\bsmith[-\s]?morra\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Kan', pattern: /\bkan\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Taimanov', pattern: /\btaimanov\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Sveshnikov', pattern: /\bsveshnikov\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Scheveningen', pattern: /\bscheveningen\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Kalashnikov', pattern: /\bkalashnikov\b/i },
    { opening: 'Sicilian Defense', specificOpening: 'Maroczy Bind', pattern: /\bmaroczy\b/i },
    { opening: 'Sicilian Defense', specificOpening: '', pattern: /\bsicilian\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Italian Game', pattern: /\bitalian\b|\bgiuoco piano\b|\btwo knights\b|\bfried liver\b|\bevans gambit\b|\bdubov italian\b|\brousseau gambit\b|\brosentreter\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Scotch Game', pattern: /\bscotch\b|\bhaggis[-\s]?grodzize\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Ruy Lopez', pattern: /\bruy lopez\b|\bspanish (game|opening)\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'King\'s Gambit', pattern: /\bking['’]?s gambit\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Vienna Game', pattern: /\bvienna (game|gambit)\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Bishop\'s Opening', pattern: /\bbishop['’]?s opening\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Philidor Defense', pattern: /\bphilidor\b/i },
    { opening: 'King\'s Pawn Opening', specificOpening: 'Petrov Defense', pattern: /\bpetrov\b|\bpetroff\b/i },
    { opening: 'Caro-Kann Defense', specificOpening: 'Advance Variation', pattern: /\badvance caro[-\s]?kann\b|\bcaro[-\s]?kann advance\b/i },
    { opening: 'Caro-Kann Defense', specificOpening: 'Exchange Variation', pattern: /\bexchange caro[-\s]?kann\b|\bcaro[-\s]?kann exchange\b/i },
    { opening: 'Caro-Kann Defense', specificOpening: '', pattern: /\bcaro[-\s]?kann\b/i },
    { opening: 'French Defense', specificOpening: 'Advance Variation', pattern: /\badvance french\b|\bfrench advance\b/i },
    { opening: 'French Defense', specificOpening: 'Exchange Variation', pattern: /\bexchange french\b|\bfrench exchange\b/i },
    { opening: 'French Defense', specificOpening: 'Winawer Variation', pattern: /\bwinawer\b/i },
    { opening: 'French Defense', specificOpening: 'Tarrasch Variation', pattern: /\btarrasch french\b|\bfrench tarrasch\b/i },
    { opening: 'French Defense', specificOpening: '', pattern: /\bfrench (defen[cs]e|defence)\b|\bfrench\b/i },
    { opening: 'Scandinavian Defense', specificOpening: '', pattern: /\bscandinavian\b|\bcenter counter\b/i },
    { opening: 'Alekhine Defense', specificOpening: '', pattern: /\balekhine['’]?s? defense\b|\balekhine['’]?s? defence\b|\balekhine\b/i },
    { opening: 'Pirc Defense', specificOpening: '', pattern: /\bpirc\b/i },
    { opening: 'Modern Defense', specificOpening: '', pattern: /\bmodern defense\b|\bmodern defence\b/i },
    { opening: 'Nimzowitsch Defense', specificOpening: '', pattern: /\bnimzowitsch\b/i },
    { opening: 'Owen Defense', specificOpening: '', pattern: /\bowen['’]?s? defense\b|\bowen['’]?s? defence\b/i },
    { opening: 'Queen\'s Gambit', specificOpening: 'Accepted', pattern: /\bqueen['’]?s gambit accepted\b|\bqga\b/i },
    { opening: 'Queen\'s Gambit', specificOpening: 'Declined', pattern: /\bqueen['’]?s gambit declined\b|\bqgd\b/i },
    { opening: 'Queen\'s Gambit', specificOpening: 'Albin Countergambit', pattern: /\balbin countergambit\b/i },
    { opening: 'Queen\'s Gambit', specificOpening: '', pattern: /\bqueen['’]?s gambit\b/i },
    { opening: 'Indian Defenses', specificOpening: 'King\'s Indian Defense', pattern: /\bking['’]?s indian\b|\bkid\b|\bsamisch\b|\bsämisch\b|\bfianchetto\b|\bmakogonov\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Nimzo-Indian Defense', pattern: /\bnimzo[-\s]?indian\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Bogo-Indian Defense', pattern: /\bbogo[-\s]?indian\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Trompowsky Attack', pattern: /\btrompowsky\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Torre Attack', pattern: /\btorre attack\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Benko Gambit', pattern: /\bbenko\b|\bvolga gambit\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Benoni Defense', pattern: /\bbenoni\b/i },
    { opening: 'Indian Defenses', specificOpening: 'Grunfeld Defense', pattern: /\bgrunfeld\b|\bgruenfeld\b/i },
    { opening: 'Queen\'s Pawn Opening', specificOpening: 'London System', pattern: /\blondon system\b/i },
    { opening: 'Queen\'s Pawn Opening', specificOpening: 'Colle System', pattern: /\bcolle\b/i },
    { opening: 'Queen\'s Pawn Opening', specificOpening: 'Slav Defense', pattern: /\bslav defense\b|\bslav defence\b/i },
    { opening: 'Queen\'s Pawn Opening', specificOpening: 'Semi-Slav Defense', pattern: /\bsemi[-\s]?slav\b/i },
    { opening: 'Queen\'s Pawn Opening', specificOpening: 'Dutch Defense', pattern: /\bdutch defense\b|\bdutch defence\b/i },
    { opening: 'English Opening', specificOpening: '', pattern: /\benglish opening\b|\b1\.?\s*c4\b/i },
    { opening: 'Flank Openings', specificOpening: 'Bird Opening', pattern: /\bbird['’]?s? opening\b|\b1\.?\s*f4\b/i },
    { opening: 'Flank Openings', specificOpening: 'Nimzo-Larsen Attack', pattern: /\bnimzo[-\s]?larsen\b|\b1\.?\s*b3\b/i },
    { opening: 'Flank Openings', specificOpening: 'Polish Opening', pattern: /\bpolish opening\b|\b1\.?\s*b4\b/i },
    { opening: 'Unorthodox Openings', specificOpening: 'Englund Gambit', pattern: /\benglund\b/i },
    { opening: 'Unorthodox Openings', specificOpening: 'Bongcloud', pattern: /\bbongcloud\b/i }
];

function normalizeSearchTerm(value) {
    return (value || '')
        .toString()
        .toLowerCase()
        .replace(/^@+/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeCategoryGroup(category) {
    const c = normalizeSearchTerm(category);
    const map = {
        '1 e4 c5 openings': 'Openings',
        'sicilian defense': 'Openings',
        '1 e4 c6 openings': 'Openings',
        'caro kann defense': 'Openings',
        '1 e4 e5 openings': 'Openings',
        '1 e4 e6 openings': 'Openings',
        'french defense': 'Openings',
        '1 d4 openings': 'Openings',
        '1 d4 d5 openings': 'Openings',
        '1 d4 nf6 openings': 'Openings',
        '1 d4 f5 openings': 'Openings',
        '1 d4 e5 openings': 'Openings',
        '1 c4': 'Openings',
        '1 c4 openings': 'Openings',
        '1 nf3': 'Openings',
        '1 b4': 'Openings',
        '1 b4 openings': 'Openings',
        '1 f4': 'Openings',
        '1 f4 openings': 'Openings',
        'miscellaneous openings': 'Openings',
        'alekhine s defense': 'Openings',
        'alekhines defense': 'Openings',
        'modern defense': 'Openings',
        'nimzowitsch defense': 'Openings',
        'owen s defense': 'Openings',
        'owens defense': 'Openings',
        'pirc defense': 'Openings',
        'scandinavian defense': 'Openings',
        'chess variants': 'Chess Variants',
        'compositions': 'Puzzles',
        'endgame': 'Endgames',
        'games': 'Games',
        'puzzles': 'Puzzles',
        'strategy': 'Strategy'
    };
    return map[c] || category || 'General';
}

function deriveOpeningFamilyFromCategory(category) {
    const c = normalizeSearchTerm(category);
    const map = {
        '1 e4 c5 openings': 'Sicilian Defense',
        'sicilian defense': 'Sicilian Defense',
        '1 e4 c6 openings': 'Caro-Kann Defense',
        'caro kann defense': 'Caro-Kann Defense',
        '1 e4 e5 openings': 'King\'s Pawn Opening',
        '1 e4 e6 openings': 'French Defense',
        'french defense': 'French Defense',
        '1 d4 openings': 'Queen\'s Pawn Opening',
        '1 d4 d5 openings': 'Queen\'s Pawn Opening',
        '1 d4 nf6 openings': 'Indian Defenses',
        '1 d4 f5 openings': 'Queen\'s Pawn Opening',
        '1 d4 e5 openings': 'Unorthodox Openings',
        '1 c4': 'English Opening',
        '1 c4 openings': 'English Opening',
        '1 nf3': 'Flank Openings',
        '1 b4': 'Flank Openings',
        '1 b4 openings': 'Flank Openings',
        '1 f4': 'Flank Openings',
        '1 f4 openings': 'Flank Openings',
        'miscellaneous openings': 'Unorthodox Openings',
        'alekhine s defense': 'Alekhine Defense',
        'alekhines defense': 'Alekhine Defense',
        'modern defense': 'Modern Defense',
        'nimzowitsch defense': 'Nimzowitsch Defense',
        'owen s defense': 'Owen Defense',
        'owens defense': 'Owen Defense',
        'pirc defense': 'Pirc Defense',
        'scandinavian defense': 'Scandinavian Defense'
    };
    return map[c] || '';
}

function isOpeningCategoryGroup(category) {
    return category === 'Openings';
}

function deriveOpeningTaxonomy(study) {
    const primaryHaystack = [
        study.category,
        study.title,
        study.notes,
        study.viewerNote,
        study.generated?.title,
        study.generated?.selectedChapterName
    ].filter(Boolean).join(' ');

    const fullHaystack = [
        primaryHaystack,
        study.generated?.searchText,
        ...(study.generated?.chapterNames || [])
    ].filter(Boolean).join(' ');

    for (const entry of OPENING_TAXONOMY) {
        if (!entry.pattern.test(primaryHaystack)) continue;
        const specificOpenings = getSpecificOpeningsForFamily(entry.opening, fullHaystack, entry.specificOpening);
        return {
            categoryGroup: 'Openings',
            opening: entry.opening,
            specificOpening: specificOpenings[0] || entry.specificOpening,
            specificOpenings
        };
    }

    const categoryOpening = deriveOpeningFamilyFromCategory(study.category);
    if (categoryOpening) {
        const specificOpenings = getSpecificOpeningsForFamily(categoryOpening, fullHaystack);
        return {
            categoryGroup: 'Openings',
            opening: categoryOpening,
            specificOpening: specificOpenings[0] || '',
            specificOpenings
        };
    }

    return {
        categoryGroup: normalizeCategoryGroup(study.category),
        opening: isOpeningCategory(study.category) ? 'Unclassified Opening' : '',
        specificOpening: '',
        specificOpenings: []
    };
}

function getSpecificOpeningsForFamily(opening, haystack, first = '') {
    const matches = [];
    if (first) matches.push(first);
    OPENING_TAXONOMY
        .filter(entry => entry.opening === opening && entry.specificOpening)
        .forEach(entry => {
            if (entry.pattern.test(haystack)) matches.push(entry.specificOpening);
        });
    return [...new Set(matches)];
}

function deriveThemes(study) {
    const text = normalizeSearchTerm([
        study.category,
        study.title,
        study.notes,
        study.viewerNote,
        study.generated?.searchText
    ].filter(Boolean).join(' '));
    const themes = new Set();
    const addIf = (label, pattern) => { if (pattern.test(text)) themes.add(label); };

    addIf('Tactics', /\btactic|trap|sacrifice|attack|mate\b/);
    addIf('Strategy', /\bstrategy|positional|structure|imbalance|plan|outpost|space\b/);
    addIf('Endgame', /\bendgame|opposition|checkmate with|rook ending|pawn ending\b/);
    addIf('Puzzles', /\bpuzzle|composition|mate in|study problem\b/);
    addIf('Repertoire', /\brepertoire|full repertoire|system against\b/);
    addIf('Model Games', /\bgame analysis|sample game|grandmaster games|history\b/);

    return [...themes];
}

function enrichStudyRecord(study) {
    const taxonomy = deriveOpeningTaxonomy(study);
    const themes = deriveThemes(study);
    const searchFields = [
        study.title,
        authorDisplay(study),
        study.category,
        taxonomy.categoryGroup,
        taxonomy.opening,
        taxonomy.specificOpening,
        ...(taxonomy.specificOpenings || []),
        study.side,
        study.notes,
        study.viewerNote,
        study.keyword,
        study.featuredDescription,
        themes.join(' '),
        study.generated?.intro,
        study.generated?.searchText,
        ...(study.generated?.chapterNames || [])
    ];

    return {
        ...study,
        rawCategory: study.category,
        categoryGroup: taxonomy.categoryGroup,
        opening: taxonomy.opening,
        specificOpening: taxonomy.specificOpening,
        specificOpenings: taxonomy.specificOpenings || [],
        themes,
        normalizedSearchText: normalizeSearchTerm(searchFields.filter(Boolean).join(' '))
    };
}

function updateSearchSuggestions(term) {
    const box = document.getElementById('searchSuggestions');
    if (!term || term.length < 2 || !window.chessData) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }

    const t = normalizeSearchTerm(term);

    const authors = [...new Set(window.chessData.flatMap(i => i.authors || [i.author]))]
        .filter(a => normalizeSearchTerm(a).includes(t))
        .slice(0, 4);

    const openings = getFilterOptions('opening')
        .filter(o => normalizeSearchTerm(o).includes(t))
        .slice(0, 4);

    const variations = getFilterOptions('specificOpening')
        .filter(v => normalizeSearchTerm(v).includes(t))
        .slice(0, 4);

    const categories = [...new Set(window.chessData.map(i => i.categoryGroup))]
        .filter(c => c && c !== 'General' && normalizeSearchTerm(c).includes(t))
        .slice(0, 4);

    if (!authors.length && !openings.length && !variations.length && !categories.length) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }

    const rows = [
        ...authors.map(a => `<div class="suggestion-row" onclick="selectAuthorSuggestion('${a.replace(/'/g, "\\'")}')"><span>${escapeHTML(a)}</span><span class="suggestion-kind">Author</span></div>`),
        ...openings.map(o => `<div class="suggestion-row" onclick="selectOpeningSuggestion('${o.replace(/'/g, "\\'")}')"><span>${escapeHTML(o)}</span><span class="suggestion-kind">Opening</span></div>`),
        ...variations.map(v => `<div class="suggestion-row" onclick="selectVariationSuggestion('${v.replace(/'/g, "\\'")}')"><span>${escapeHTML(v)}</span><span class="suggestion-kind">Variation</span></div>`),
        ...categories.map(c => `<div class="suggestion-row" onclick="selectCategorySuggestion('${c.replace(/'/g, "\\'")}')"><span>${escapeHTML(c)}</span><span class="suggestion-kind">Category</span></div>`)
    ];

    box.innerHTML = rows.join('');
    box.classList.remove('hidden');
}

function hideSearchSuggestions() {
    const box = document.getElementById('searchSuggestions');
    box.classList.add('hidden');
    box.innerHTML = '';
}

function selectAuthorSuggestion(author) {
    hideSearchSuggestions();
    filterByAuthor(author);
}

function selectCategorySuggestion(category) {
    hideSearchSuggestions();
    document.getElementById('searchInput').value = '';
    setFilter(category);
}

function selectOpeningSuggestion(opening) {
    hideSearchSuggestions();
    document.getElementById('searchInput').value = '';
    const matchingStudy = window.chessData.find(study => study.opening === opening);
    if (matchingStudy) currentFilter = matchingStudy.categoryGroup;
    currentOpeningFilter = opening;
    currentAuthor = null;
    currentPage = 1;
    createFilters();
    renderArchive();
}

function selectVariationSuggestion(variation) {
    hideSearchSuggestions();
    document.getElementById('searchInput').value = '';
    const matchingStudy = window.chessData.find(study => (study.specificOpenings || [study.specificOpening]).includes(variation));
    if (matchingStudy) {
        currentFilter = matchingStudy.categoryGroup;
        currentOpeningFilter = matchingStudy.opening || 'All Openings';
    }
    currentVariationFilter = variation;
    currentAuthor = null;
    currentPage = 1;
    createFilters();
    renderArchive();
}

function toggleAbout() {
    const el = document.getElementById('aboutPage');
    el.classList.toggle('hidden');
    document.body.style.overflow = el.classList.contains('hidden') ? 'auto' : 'hidden';
}

function toggleSubmit() {
    const el = document.getElementById('submitPage');
    el.classList.toggle('hidden');
    document.body.style.overflow = el.classList.contains('hidden') ? 'auto' : 'hidden';
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');

    syncThemeControls(isLight);

    try { localStorage.setItem('scf-theme', isLight ? 'light' : 'dark'); } catch (e) {}
}

function syncThemeControls(isLight) {
    const iconMarkup = isLight
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646A9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
    ['themeIcon', 'themeIconInline'].forEach(id => {
        const icon = document.getElementById(id);
        if (icon) icon.innerHTML = iconMarkup;
    });
    const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    ['themeToggle', 'themeToggleInline'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.setAttribute('aria-label', label);
    });
}

function applyStoredTheme() {
    let stored = null;
    try { stored = localStorage.getItem('scf-theme'); } catch (e) {}
    if (stored === 'light') {
        document.body.classList.add('light-mode');
        syncThemeControls(true);
    } else if (stored === 'dark') {
        document.body.classList.remove('light-mode');
        syncThemeControls(false);
    } else {
        syncThemeControls(document.body.classList.contains('light-mode'));
    }
}

function getSurprisedLinks() {
    try {
        return new Set(JSON.parse(localStorage.getItem('scf-surprised-links') || '[]'));
    } catch (e) {
        return new Set();
    }
}

function saveSurprisedLinks(set) {
    try { localStorage.setItem('scf-surprised-links', JSON.stringify([...set])); } catch (e) {}
}

function surpriseMe() {
    if (!window.chessData || window.chessData.length === 0) return;

    let shown = getSurprisedLinks();
    let pool = window.chessData.filter(s => !shown.has(s.link));

    if (pool.length === 0) {
        shown = new Set();
        pool = window.chessData;
    }

    const randomStudy = pool[Math.floor(Math.random() * pool.length)];
    shown.add(randomStudy.link);
    saveSurprisedLinks(shown);
    currentFilter = 'All';
    currentOpeningFilter = 'All Openings';
    currentVariationFilter = 'All Variations';
    currentSideFilter = 'Any Side';
    currentStaffPickFilter = 'Any';
    currentAuthor = null;
    currentAuthorFilter = 'All Authors';
    currentThemeFilter = 'All Themes';
    currentSubFilter = null;
    showFavoritesOnly = false;
    document.getElementById('searchInput').value = '';
    recordView(randomStudy.link);
    window.location.href = randomStudy.link;
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        const toast = document.getElementById('copyToast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}

function getRecentViews() {
    try {
        return JSON.parse(localStorage.getItem('scf-recent-views') || '[]');
    } catch (e) {
        return [];
    }
}

function recordView(link) {
    let arr = getRecentViews();
    arr = arr.filter(l => l !== link);
    arr.unshift(link);
    arr = arr.slice(0, 10);
    try { localStorage.setItem('scf-recent-views', JSON.stringify(arr)); } catch (e) {}
}

function getFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem('scf-favorites') || '[]'));
    } catch (e) {
        return new Set();
    }
}

function saveFavorites(set) {
    try { localStorage.setItem('scf-favorites', JSON.stringify([...set])); } catch (e) {}
}

function isFavorite(link) {
    return getFavorites().has(link);
}

function toggleFavorite(link, btnEl) {
    const favs = getFavorites();
    if (favs.has(link)) {
        favs.delete(link);
    } else {
        favs.add(link);
    }
    saveFavorites(favs);
    if (btnEl) btnEl.classList.toggle('active', favs.has(link));
    if (showFavoritesOnly) renderArchive();
}

let showFavoritesOnly = false;

function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    document.getElementById('favoritesToggle').classList.toggle('active', showFavoritesOnly);
    currentPage = 1;
    renderArchive();
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        }
    });
}, { threshold: 0.1 });

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

function normalizeAuthorName(name) {
    return (name || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/^@+/, '')
        .replace(/\s+/g, ' ');
}

function cleanAuthorName(name) {
    return (name || '')
        .toString()
        .trim()
        .replace(/^@+/, '')
        .replace(/\s+/g, ' ');
}

function parseAuthors(value) {
    const authors = (value || '')
        .toString()
        .split(',')
        .map(cleanAuthorName)
        .filter(Boolean);
    return authors.length ? [...new Map(authors.map(author => [normalizeAuthorName(author), author])).values()] : ['Anonymous'];
}

function authorDisplay(study) {
    return (study.authors && study.authors.length ? study.authors : [study.author]).join(', ');
}

function studyHasAuthor(study, authorName) {
    const target = normalizeAuthorName(authorName);
    return (study.authors || [study.author]).some(author => normalizeAuthorName(author) === target);
}

function normalizeStudyLink(value) {
    const link = (value || '').toString().replace(/"/g, '').trim();
    if (!link) return '#';
    if (/^https?:\/\//i.test(link)) return link;
    if (/^(www\.)?lichess\.org\//i.test(link)) return `https://${link.replace(/^www\./i, '')}`;
    return link;
}

function escapeHTML(value) {
    return (value || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getKeywordList(value) {
    return (value || '')
        .toString()
        .split(/[,;|]/)
        .map(v => v.trim().toUpperCase())
        .filter(Boolean);
}

function isFeaturedStudy(study) {
    return getKeywordList(study.keyword).includes(FEATURED_KEYWORD);
}

function isStaffPickStudy(study) {
    return (study.notes || '').toString().toUpperCase().includes('STAR');
}

function matchesSearch(study, term) {
    if (!term) return false;
    const t = normalizeSearchTerm(term);
    if (!t) return false;
    return (study.normalizedSearchText || '').includes(t);
}

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

const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.timestamp || !parsed.csv) return null;
        return parsed;
    } catch (e) {
        return null;
    }
}

function writeCache(key, csv) {
    try {
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), csv }));
    } catch (e) {}
}

async function fetchCsvCached(url, cacheKey) {
    const cached = readCache(cacheKey);
    const isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

    if (isFresh) {
        fetch(url).then(res => res.text()).then(csv => writeCache(cacheKey, csv)).catch(() => {});
        return cached.csv;
    }

    try {
        const res = await fetch(url);
        const csv = await res.text();
        writeCache(cacheKey, csv);
        return csv;
    } catch (err) {
        if (cached) return cached.csv;
        throw err;
    }
}

function showLoadingState() {
    const grid = document.getElementById('resultsGrid');
    grid.style.display = 'grid';
    grid.innerHTML = Array.from({ length: 6 }).map(() => `
        <div class="chess-card reveal" style="pointer-events:none;">
            <div class="h-40 w-full" style="background: var(--border); opacity:0.4;"></div>
            <div class="p-8">
                <div style="height:8px;width:40%;background:var(--border);border-radius:4px;margin-bottom:14px;"></div>
                <div style="height:18px;width:80%;background:var(--border);border-radius:4px;margin-bottom:16px;"></div>
                <div style="height:10px;width:30%;background:var(--border);border-radius:4px;"></div>
            </div>
        </div>
    `).join('');
    document.getElementById('liveCounter').innerText = 'LOADING THE ARCHIVE...';
}

function showLoadErrorState() {
    const grid = document.getElementById('resultsGrid');
    const noRes = document.getElementById('noResults');
    grid.style.display = 'none';
    noRes.style.display = 'block';
    noRes.innerHTML = `
        <p class="text-lg">The archive couldn't be loaded right now.</p>
        <p class="text-sm mt-2 opacity-70">This is usually a temporary connection hiccup.</p>
        <button onclick="loadData()" class="gold-accent text-[10px] mt-4 uppercase tracking-widest underline">Try again</button>
    `;
    document.getElementById('liveCounter').innerText = 'ARCHIVE UNAVAILABLE';
}

async function loadAuthorData() {
    try {
        const csv = await fetchCsvCached(authorSheetUrl, 'scf-author-csv');
        const rows = parseCSV(csv);

        window.authorData = rows.slice(1).map(c => ({
            author: cleanAuthorName(c[0]) || "",
            bio: c[1]?.trim() || "",
            country: c[2]?.trim() || "",
            style: c[3]?.trim() || "",
            links: c[4]?.trim() || ""
        })).filter(i => i.author !== "");
    } catch (err) {
        console.error('Author sheet failed to load:', err);
        window.authorData = [];
    }
}

async function loadStudyPreviewData() {
    try {
        const res = await fetch('study-preview-data.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('not found');
        window.studyPreviewData = await res.json();
    } catch (e) {
        window.studyPreviewData = null;
    }
}

async function loadGeneratedStudyData() {
    try {
        const res = await fetch('generated/lichess-study-data.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('not found');
        window.generatedStudyData = await res.json();
    } catch (e) {
        window.generatedStudyData = { studies: {} };
    }
}

function getGeneratedStudyData(link) {
    const id = getLichessStudyId(link);
    return id && window.generatedStudyData?.studies ? window.generatedStudyData.studies[id] : null;
}

async function loadData() {
    document.getElementById('noResults').style.display = 'none';
    showLoadingState();

    try {
        await loadAuthorData();
        await loadStudyPreviewData();
        await loadGeneratedStudyData();

        const csv = await fetchCsvCached(sheetUrl, 'scf-studies-csv');
        const rows = parseCSV(csv);

        window.chessData = rows.slice(1).map((c, index) => {
            const rawAuthor = c[4]?.replace(/"/g, '') || "Anonymous";
            const authors = parseAuthors(rawAuthor);
            const link = normalizeStudyLink(c[5]);
            const generated = getGeneratedStudyData(link);
            const manualImage = (c[8] && c[8].includes('http')) ? c[8].replace(/"/g, '').trim() : "";
            const fallbackImage = "https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=800&q=80";
            const hasResolvedScreenshotThumbnail = generated?.thumbnailSource === 'screenshot-fen-override' || generated?.thumbnailSource === 'screenshot-fen-reference';
            const hasStudyFenThumbnail = Boolean(generated?.thumbnailPath && generated?.thumbnailFen && (generated?.pgnFetched || generated?.thumbnailSource === 'lichess-final-mainline'));
            const shouldUseGeneratedThumbnail = hasStudyFenThumbnail || hasResolvedScreenshotThumbnail;
            return enrichStudyRecord({
                side: c[1]?.replace(/"/g, '') || "Universal",
                category: c[2]?.replace(/"/g, '') || "General",
                title: c[3]?.replace(/"/g, '') || "Untitled",
                author: authors[0],
                authors,
                authorRaw: rawAuthor,
                authorDisplay: authors.join(', '),
                link,
                notes: c[6]?.replace(/"/g, '') || "",
                viewerNote: c[7]?.replace(/"/g, '')?.trim() || "",
                image: shouldUseGeneratedThumbnail ? generated.thumbnailPath : (manualImage || fallbackImage),
                thumbnailSource: shouldUseGeneratedThumbnail ? (hasResolvedScreenshotThumbnail ? 'screenshot-generated' : 'study-generated') : (manualImage ? 'manual' : 'fallback'),
                generated,
                difficulty: c[9]?.replace(/"/g, '').trim() || "",
                createdAt: c[10]?.replace(/"/g, '').trim() || "",
                sourceIndex: index,
                keyword: c[11]?.replace(/"/g, '').trim() || "",
                featuredDescription: c[12]?.replace(/"/g, '').trim() || ""
            });
        }).filter(i => i.title !== "").reverse();

        markNewStudies(window.chessData);

        readUrlParams();
        renderFeaturedStudy();
        renderLatest();
        renderRecentlyViewed();
        createFilters();
        renderArchive();
        startCarouselAutoplay();
    } catch (err) {
        console.error(err);
        showLoadErrorState();
    }
}

function startCarouselAutoplay() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        if (document.hidden) return;
        moveCarousel(1);
    }, 8000);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(carouselInterval);
    } else {
        startCarouselAutoplay();
    }
});

function getSeenLinks() {
    try {
        return new Set(JSON.parse(localStorage.getItem('scf-seen-links') || '[]'));
    } catch (e) {
        return new Set();
    }
}

function saveSeenLinks(links) {
    try { localStorage.setItem('scf-seen-links', JSON.stringify(links)); } catch (e) {}
}

function markNewStudies(data) {
    const seen = getSeenLinks();
    const isFirstVisit = seen.size === 0;

    data.forEach(i => {
        i.isNew = !isFirstVisit && !seen.has(i.link);
    });

    saveSeenLinks(data.map(i => i.link));
    showNewSinceVisitBanner(isFirstVisit ? 0 : data.filter(i => i.isNew).length);
}

function showNewSinceVisitBanner(count) {
    const banner = document.getElementById('newSinceVisitBanner');
    if (!count) {
        banner.classList.add('hidden');
        return;
    }
    document.getElementById('newSinceVisitText').textContent =
        `${count} new ${count === 1 ? 'study' : 'studies'} since your last visit`;
    banner.classList.remove('hidden');
}

function jumpToNewStudies() {
    const target = document.getElementById('latestSection');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getLichessStudyId(link) {
    try {
        const u = new URL(link);
        if (!/lichess\.org$/i.test(u.hostname.replace(/^www\./i, ''))) return null;
        const parts = u.pathname.split('/').filter(Boolean);
        return parts[0] === 'study' && parts[1] ? parts[1] : null;
    } catch (e) {
        return null;
    }
}

// Piece artwork: "cburnett" set by Colin M.L. Burnett -- the same set Lichess
// uses as its default. Multi-licensed (BSD / GFDL / CC-BY-SA / GPL) by the
// author specifically for reuse; sourced from lichess-org/lila (public repo).
const PIECE_SYMBOL_DEFS = `
    <symbol id="piece-wk" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6M20 8h5"/><path fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#fff" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></symbol>
    <symbol id="piece-wq" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></symbol>
    <symbol id="piece-wr" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="m34 14-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="m31 29.5 1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></symbol>
    <symbol id="piece-wb" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></symbol>
    <symbol id="piece-wn" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5"/></g></symbol>
    <symbol id="piece-wp" viewBox="0 0 45 45"><path fill="#fff" stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></symbol>
    <symbol id="piece-bk" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.6V6"/><path fill="#000" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#000" d="M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path stroke-linejoin="miter" d="M20 8h5"/><path stroke="#ececec" d="M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9"/><path stroke="#ececec" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></symbol>
    <symbol id="piece-bq" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" stroke-linecap="butt" d="M11 38.5a35 35 1 0 0 23 0"/><path fill="none" stroke="#ececec" d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0"/></g></symbol>
    <symbol id="piece-br" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M14 29.5v-13h17v13z"/><path stroke-linecap="butt" d="M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z"/><path fill="none" stroke="#ececec" stroke-linejoin="miter" stroke-width="1" d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"/></g></symbol>
    <symbol id="piece-bb" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke="#ececec" stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></symbol>
    <symbol id="piece-bn" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#000" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#000" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"/><path fill="#ececec" stroke="#ececec" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5"/><path fill="#ececec" stroke="none" d="m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z"/></g></symbol>
    <symbol id="piece-bp" viewBox="0 0 45 45"><path stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z"/></symbol>
`;

function renderStaticBoardSVG(fen) {
    const boardPart = (fen || '').split(' ')[0];
    const rows = boardPart ? boardPart.split('/') : [];
    if (rows.length !== 8) return null;

    const grid = rows.map(row => {
        const squares = [];
        for (const ch of row) {
            if (/\d/.test(ch)) {
                for (let i = 0; i < parseInt(ch, 10); i++) squares.push(null);
            } else {
                squares.push(ch);
            }
        }
        return squares;
    });

    if (grid.some(row => row.length !== 8)) return null;

    const size = 320;
    const sq = size / 8;
    const light = '#e8dcc4';
    const dark = '#8a7458';

    let squaresHtml = '';
    let piecesHtml = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const isLight = (r + c) % 2 === 0;
            const x = c * sq;
            const y = r * sq;
            squaresHtml += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${isLight ? light : dark}" />`;

            const piece = grid[r][c];
            if (piece) {
                const isWhite = piece === piece.toUpperCase();
                const colorPrefix = isWhite ? 'w' : 'b';
                const pad = sq * 0.04;
                piecesHtml += `<use href="#piece-${colorPrefix}${piece.toLowerCase()}" x="${x + pad}" y="${y + pad}" width="${sq - pad * 2}" height="${sq - pad * 2}"/>`;
            }
        }
    }

    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; display:block;"><defs>${PIECE_SYMBOL_DEFS}</defs>${squaresHtml}${piecesHtml}</svg>`;
}

function handleStudyLinkClick(e, link) {
    recordView(link);
    return true;
}

function authorLinksHtml(study) {
    const authors = study.authors && study.authors.length ? study.authors : [study.author];
    return authors.map(author =>
        `<button type="button" onclick="filterByAuthor('${author.replace(/'/g, "\\'")}')" class="card-author-link gold-accent brand-font" title="View ${escapeHTML(author)}">${escapeHTML(author)}</button>`
    ).join('<span class="card-author-separator">,</span>');
}

function primaryTaxonomyLabel(study) {
    return study.opening || study.categoryGroup || study.category;
}

function taxonomySummary(study) {
    if (study.categoryGroup === 'Openings') {
        return study.opening ? `Openings: ${study.opening}` : 'Openings';
    }
    return study.categoryGroup || study.category || 'General';
}

function getFeaturedStudy() {
    if (!window.chessData || window.chessData.length === 0) return null;

    const manual = window.chessData.find(i => isFeaturedStudy(i));
    if (manual) return manual;

    const staffPicks = window.chessData.filter(i => i.notes.toUpperCase().includes("STAR"));
    if (staffPicks.length > 0) return staffPicks[0];

    const withViewerNotes = window.chessData.filter(i => i.viewerNote && i.viewerNote.trim() !== "");
    if (withViewerNotes.length > 0) return withViewerNotes[0];

    return window.chessData[0];
}

function renderFeaturedStudy() {
    const featured = getFeaturedStudy();
    const container = document.getElementById('featuredStudyContainer');
    const section = document.getElementById('featuredSection');

    if (!featured) {
        section.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    section.classList.remove('hidden');

    const cleanNotes = featured.notes.replace(/STAR/gi, '').trim();
    const spotlightText = featured.featuredDescription || featured.viewerNote || cleanNotes || "A carefully selected study from the archive.";
    const thumbnailClass = `thumbnail-${featured.thumbnailSource || 'fallback'}`;

    container.innerHTML = `
        <div class="featured-shell">
            <div class="featured-layout grid md:grid-cols-[minmax(280px,390px)_minmax(0,1fr)]">
                <a href="${featured.link}" onclick="return handleStudyLinkClick(event, '${featured.link.replace(/'/g, "\\'")}')" class="featured-image ${thumbnailClass} block relative">
                    <img src="${featured.image}" alt="${featured.title}" onerror="this.src='https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=800&q=80'">
                </a>

                <div class="featured-copy-panel flex flex-col justify-center relative z-10 border-t md:border-t-0 md:border-l">
                    <div class="featured-meta-row">
                        <div class="featured-badge brand-font px-3 py-1 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] rounded-sm">Featured Study</div>
                        <div class="forest-tag brand-font">${featured.side}</div>
                        ${featured.difficulty ? `<div class="skill-tag brand-font">${featured.difficulty}</div>` : ''}
                    </div>
                    <h2 class="text-xl md:text-2xl brand-font parchment-text leading-snug mb-3">${featured.title}</h2>
                    <div class="featured-author-line brand-font text-xs mb-5">By ${authorLinksHtml(featured)}</div>

                    <div class="space-y-3 mb-6">
                        <p class="featured-spotlight-text italic leading-relaxed text-sm max-w-xl line-clamp-3">
                            ${spotlightText}
                        </p>
                        <p class="featured-taxonomy-text text-[11px] italic leading-relaxed">
                            Category: ${taxonomySummary(featured)}
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <a href="${featured.link}" target="_blank" onclick="recordView('${featured.link.replace(/'/g, "\\'")}')" class="featured-btn primary-action px-5 py-2.5 rounded-sm text-[9px] brand-font font-bold uppercase tracking-[0.25em] transition-all">
                            Open Study
                        </a>

                        <button onclick="copyLink('${featured.link}')" class="featured-btn px-5 py-2.5 rounded-sm text-[9px] brand-font font-bold uppercase tracking-[0.25em] text-[var(--heading)] hover:text-[var(--accent)] transition-all">
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRecentlyViewed() {
    const links = getRecentViews();
    const container = document.getElementById('recentlyViewedGrid');
    const section = document.getElementById('recentlyViewedSection');
    if (!container || !section) return;

    const items = links
        .map(link => window.chessData.find(s => s.link === link))
        .filter(Boolean)
        .slice(0, 9);

    window.hasRecentViews = items.length > 0;

    if (!items.length) {
        container.innerHTML = '';
        return;
    }

    const favorites = getFavorites();
    container.innerHTML = items.map(i => `<div class="carousel-item">${cardHtml(i, favorites)}</div>`).join('');
    container.querySelectorAll('.chess-card').forEach(el => revealObserver.observe(el));
}

function renderLatest() {
    const grid = document.getElementById('latestGrid');
    const favorites = getFavorites();
    grid.innerHTML = window.chessData.slice(0, 9).map(i => `<div class="carousel-item">${cardHtml(i, favorites)}</div>`).join('');
    grid.querySelectorAll('.chess-card').forEach(el => revealObserver.observe(el));
}

function moveCarousel(dir) {
    const grid = document.getElementById('latestGrid');
    if (!grid || !grid.querySelector('.carousel-item')) return;

    const itemsInView = window.innerWidth > 1024 ? 3 : (window.innerWidth > 640 ? 2 : 1);
    const totalItems = Math.min(9, window.chessData.length);
    const maxPos = Math.max(0, totalItems - itemsInView);

    carouselPos = (carouselPos + dir);
    if (carouselPos > maxPos) carouselPos = 0;
    if (carouselPos < 0) carouselPos = maxPos;

    const itemWidth = grid.querySelector('.carousel-item').offsetWidth;
    const gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap) || 0;
    grid.style.transform = `translateX(-${carouselPos * (itemWidth + gap)}px)`;
}

function cardHtml(i, favorites = getFavorites()) {
    const isStar = i.notes.toUpperCase().includes("STAR");
    const noteOverlay = i.viewerNote ? `<div class="note-overlay brand-font font-bold uppercase tracking-wider"><span class="block text-[8px] mb-1 opacity-60">Viewer Notes:</span>${i.viewerNote}</div>` : '';
    const favActive = favorites.has(i.link) ? 'active' : '';
    const favTopClass = isStar ? 'top-11' : 'top-3';
    const thumbnailClass = `thumbnail-${i.thumbnailSource || 'fallback'}`;

    return `
    <div class="chess-card flex flex-col group relative">
        ${isStar ? `<div class="absolute top-0 right-0 z-40 staff-pick-ribbon px-3 py-1 font-bold text-[8px] brand-font uppercase tracking-tighter shadow-md">&#9733; Staff Pick</div>` : ''}
        ${noteOverlay}
        <button onclick="toggleFavorite('${i.link.replace(/'/g, "\\'")}', this)" class="fav-btn ${favActive} absolute ${favTopClass} right-3 z-40 text-white/80 hover:text-[var(--accent)]" title="Save to favorites">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>

        <a href="${i.link}" onclick="return handleStudyLinkClick(event, '${i.link.replace(/'/g, "\\'")}')" class="card-media ${thumbnailClass} w-full relative block">
            <div class="card-image-wrap ${thumbnailClass}">
                <img src="${i.image}" class="card-image" alt="${i.title}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=800&q=80'">
                <div class="image-vignette"></div>
                <div class="absolute top-4 left-4 flex items-center gap-2 z-10">
                    ${i.isNew ? `<div class="new-tag brand-font">New</div>` : ''}
                    <div class="forest-tag brand-font">${i.side}</div>
                    ${i.difficulty ? `<div class="skill-tag brand-font">${i.difficulty}</div>` : ''}
                </div>
            </div>
        </a>

        <div class="study-card-body">
            <div class="flex justify-between items-start mb-2">
                <span class="card-category text-[9px] brand-font font-semibold tracking-[0.16em] text-zinc-600 uppercase block italic" title="${escapeHTML(i.category)}">${escapeHTML(primaryTaxonomyLabel(i))}</span>
                <button onclick="copyLink('${i.link}')" class="text-zinc-600 hover:text-[var(--accent)] transition-colors" title="Copy Study Link">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            <a href="${i.link}" onclick="return handleStudyLinkClick(event, '${i.link.replace(/'/g, "\\'")}')" class="card-title brand-font parchment-text hover:text-[var(--accent)] transition-colors" title="${escapeHTML(i.title)}">${i.title}</a>

            <div class="card-author" title="Created by ${escapeHTML(authorDisplay(i))}">Created by ${authorLinksHtml(i)}</div>

            <p class="card-note text-zinc-500 text-[11px] italic leading-relaxed">${i.notes.replace(/STAR/gi, '')}</p>

            <a href="${i.link}" onclick="return handleStudyLinkClick(event, '${i.link.replace(/'/g, "\\'")}')" class="card-open-link brand-font">Hosted on Lichess &middot; Open &rarr;</a>
        </div>
    </div>`;
}

function getSearchScore(study, term) {
    if (!term) return 0;
    const t = normalizeSearchTerm(term);
    let score = 0;
    if (normalizeSearchTerm(study.title) === t) score += 120;
    if (normalizeSearchTerm(study.title).includes(t)) score += 70;
    if (normalizeSearchTerm(authorDisplay(study)).includes(t)) score += 55;
    if (normalizeSearchTerm(study.opening).includes(t)) score += 45;
    if (normalizeSearchTerm(study.specificOpening).includes(t)) score += 30;
    if (normalizeSearchTerm(study.specificOpenings?.join(' ')).includes(t)) score += 30;
    if (normalizeSearchTerm(study.categoryGroup).includes(t)) score += 35;
    if (normalizeSearchTerm(study.themes?.join(' ')).includes(t)) score += 28;
    if (normalizeSearchTerm(study.side).includes(t)) score += 15;
    if (normalizeSearchTerm(study.viewerNote).includes(t)) score += 12;
    if (normalizeSearchTerm(study.featuredDescription).includes(t)) score += 10;
    if (normalizeSearchTerm(study.notes).includes(t)) score += 8;
    if (normalizeSearchTerm(study.generated?.searchText).includes(t)) score += 6;
    return score;
}

function getSortedStudies(data, term = '') {
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';
    const arr = [...data];

    switch (sortValue) {
        case 'relevance':
            if (!term) return arr;
            return arr.sort((a, b) => getSearchScore(b, term) - getSearchScore(a, term));
        case 'oldest':
            return arr.reverse();
        case 'title-az':
            return arr.sort((a, b) => a.title.localeCompare(b.title));
        case 'newest':
        default:
            return arr;
    }
}

function normalizeCountryKey(value) {
    return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9\s.-]/g, '');
}

function countryToCode(country) {
    const raw = (country || '').toString().trim();
    if (!raw) return '';

    const first = raw.split(/[\/,;|]/)[0].trim();
    const normalized = normalizeCountryKey(first);

    if (/^[a-z]{2}$/i.test(first)) return first.toUpperCase();
    if (/^[a-z]{2}$/i.test(normalized)) return normalized.toUpperCase();

    const map = {
        'afghanistan': 'AF','albania': 'AL','algeria': 'DZ','andorra': 'AD','angola': 'AO',
        'argentina': 'AR','armenia': 'AM','australia': 'AU','austria': 'AT','azerbaijan': 'AZ',
        'bahamas': 'BS','bahrain': 'BH','bangladesh': 'BD','belarus': 'BY','belgium': 'BE',
        'bolivia': 'BO','bosnia and herzegovina': 'BA','botswana': 'BW','brazil': 'BR',
        'bulgaria': 'BG','canada': 'CA','chile': 'CL','china': 'CN','colombia': 'CO',
        'croatia': 'HR','cuba': 'CU','cyprus': 'CY','czech republic': 'CZ','czechia': 'CZ',
        'denmark': 'DK','dominican republic': 'DO','ecuador': 'EC','egypt': 'EG','england': 'GB',
        'estonia': 'EE','ethiopia': 'ET','finland': 'FI','france': 'FR','georgia': 'GE',
        'germany': 'DE','greece': 'GR','hungary': 'HU','iceland': 'IS','india': 'IN',
        'indonesia': 'ID','iran': 'IR','iraq': 'IQ','ireland': 'IE','israel': 'IL','italy': 'IT',
        'japan': 'JP','kazakhstan': 'KZ','kenya': 'KE','kyrgyzstan': 'KG','latvia': 'LV',
        'lebanon': 'LB','lithuania': 'LT','luxembourg': 'LU','malaysia': 'MY','mexico': 'MX',
        'moldova': 'MD','monaco': 'MC','mongolia': 'MN','morocco': 'MA','netherlands': 'NL',
        'new zealand': 'NZ','nigeria': 'NG','north korea': 'KP','norway': 'NO','pakistan': 'PK',
        'peru': 'PE','philippines': 'PH','poland': 'PL','portugal': 'PT','qatar': 'QA',
        'romania': 'RO','russia': 'RU','russian federation': 'RU','saudi arabia': 'SA',
        'scotland': 'GB','serbia': 'RS','singapore': 'SG','slovakia': 'SK','slovenia': 'SI',
        'south africa': 'ZA','south korea': 'KR','spain': 'ES','sweden': 'SE','switzerland': 'CH',
        'taiwan': 'TW','tajikistan': 'TJ','thailand': 'TH','tunisia': 'TN','turkey': 'TR',
        'uae': 'AE','uk': 'GB','united arab emirates': 'AE','united kingdom': 'GB',
        'united states': 'US','united states of america': 'US','usa': 'US','uruguay': 'UY',
        'uzbekistan': 'UZ','venezuela': 'VE','vietnam': 'VN','wales': 'GB'
    };

    return map[normalized] || '';
}

function getCountryFlag(country) {
    const code = countryToCode(country);
    if (!code || code.length !== 2) return 'ðŸŒ';
    return code.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

function splitLinks(raw) {
    return (raw || '')
        .toString()
        .split(/[\n,;|]+/g)
        .map(v => v.trim())
        .filter(Boolean);
}

function normalizeHref(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

function renderAuthorProfile(authorName, studies) {
    const section = document.getElementById('authorProfileSection');
    const content = document.getElementById('authorProfileContent');
    const title = document.getElementById('authorProfileName');
    const badge = document.getElementById('authorProfileBadge');
    const subtitle = document.getElementById('authorProfileSubtitle');
    const footer = document.getElementById('authorProfileFooter');
    const studyGrid = document.getElementById('authorStudiesGrid');
    const studyCountEl = document.getElementById('authorStudyCount');

    const profile = (window.authorData || []).find(a => normalizeAuthorName(a.author) === normalizeAuthorName(authorName));

    const studyCount = studies.length;
    const studyWord = studyCount === 1 ? 'study' : 'studies';

    const bio = profile?.bio?.trim() || 'No author profile has been added yet.';
    const country = profile?.country?.trim() || '';
    const style = profile?.style?.trim() || '';
    const linksRaw = profile?.links?.trim() || '';
    const links = splitLinks(linksRaw);
    const flag = getCountryFlag(country);

    title.textContent = cleanAuthorName(authorName);
    subtitle.textContent = `${studyCount} ${studyWord} in the library`;
    studyCountEl.textContent = `${studyCount} ${studyWord}`;

    if (country) {
        badge.classList.remove('hidden');
        badge.innerHTML = `<span class="flag">${flag}</span><span>${escapeHTML(country)}</span>`;
    } else {
        badge.classList.add('hidden');
        badge.innerHTML = '';
    }

    const svgIcon = (path) => `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${path}
        </svg>
    `;

    const cards = [];

    cards.push(`
        <div class="author-profile-card author-bio-card">
            <div class="author-card-label"><span class="dot"></span> Bio</div>
            <div class="author-card-text">${escapeHTML(bio).replace(/\n/g, '<br>')}</div>
        </div>
    `);

    if (country) {
        cards.push(`
            <div class="author-profile-card">
                <div class="author-card-label"><span class="dot"></span> Country</div>
                <div class="author-country-row">
                    <div class="author-country-flag" aria-hidden="true">${flag}</div>
                    <div class="author-country-text">
                        <div class="author-country-name">${escapeHTML(country)}</div>
                        <div class="author-country-sub">Region / nationality</div>
                    </div>
                </div>
            </div>
        `);
    }

    if (style) {
        cards.push(`
            <div class="author-profile-card">
                <div class="author-card-label"><span class="dot"></span> Style</div>
                <div class="author-card-text">${escapeHTML(style).replace(/\n/g, '<br>')}</div>
            </div>
        `);
    }

    if (links.length) {
        cards.push(`
            <div class="author-profile-card author-bio-card">
                <div class="author-card-label"><span class="dot"></span> Links</div>
                <div class="author-links-list">
                    ${links.map(link => {
                        const href = normalizeHref(link);
                        return `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" class="author-link-chip">${svgIcon('<path d="M10 13a5 5 0 0 1 0-7.07l1.5-1.5a5 5 0 0 1 7.07 7.07l-1 1" /><path d="M14 11a5 5 0 0 1 0 7.07l-1.5 1.5a5 5 0 0 1-7.07-7.07l1-1" />')}<span>${escapeHTML(link)}</span></a>`;
                    }).join('')}
                </div>
            </div>
        `);
    } else if (linksRaw) {
        cards.push(`
            <div class="author-profile-card author-bio-card">
                <div class="author-card-label"><span class="dot"></span> Links</div>
                <div class="author-card-text"><a href="${escapeHTML(normalizeHref(linksRaw))}" target="_blank" rel="noopener noreferrer" class="author-link">${escapeHTML(linksRaw)}</a></div>
            </div>
        `);
    }

    content.innerHTML = cards.join('');
    footer.textContent = country ? `${flag} ${country}` : '';
    studyGrid.innerHTML = studies.map(i => cardHtml(i, getFavorites())).join('');
    studyGrid.querySelectorAll('.chess-card').forEach(el => revealObserver.observe(el));

    section.classList.remove('hidden');
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = [];
    const windowSize = 7;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    pages.push(`<button class="filter-chip brand-font page-chip" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''}>&larr; Prev</button>`);

    if (start > 1) {
        pages.push(`<button class="filter-chip brand-font page-chip" data-page="1">1</button>`);
        if (start > 2) {
            pages.push(`<span class="filter-chip brand-font page-chip cursor-default">&hellip;</span>`);
        }
    }

    for (let p = start; p <= end; p++) {
        pages.push(`<button class="filter-chip brand-font page-chip ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            pages.push(`<span class="filter-chip brand-font page-chip cursor-default">&hellip;</span>`);
        }
        pages.push(`<button class="filter-chip brand-font page-chip" data-page="${totalPages}">${totalPages}</button>`);
    }

    pages.push(`<button class="filter-chip brand-font page-chip" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''}>Next &rarr;</button>`);

    container.innerHTML = pages.join('');
    container.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.getAttribute('data-page'), 10);
            if (!Number.isFinite(page) || page < 1 || page > totalPages) return;
            currentPage = page;
            renderArchive();
            scrollToStudyResults();
        });
    });
}

function scrollToStudyResults() {
    const anchor = document.getElementById('archiveHeader') || document.getElementById('resultsGrid');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToAuthorResults() {
    const anchor = document.getElementById('authorProfileSection');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderArchive() {
    if (document.body.classList.contains('training-view')) return;
    document.getElementById('archiveHeader').style.display = '';
    if (!isOpeningCategoryGroup(currentFilter)) {
        currentOpeningFilter = 'All Openings';
        currentVariationFilter = 'All Variations';
    }
    if (currentOpeningFilter === 'All Openings') currentVariationFilter = 'All Variations';

    const term = document.getElementById('searchInput').value.trim().toLowerCase();
    const renderFavorites = getFavorites();

    let filtered = window.chessData.filter(i => {
        const matchesText = matchesSearch(i, term) || term.length === 0;
        const matchesOpening = currentOpeningFilter === 'All Openings' || i.opening === currentOpeningFilter;
        const matchesVariation = currentVariationFilter === 'All Variations' || (i.specificOpenings || [i.specificOpening]).includes(currentVariationFilter);
        const matchesCategory = currentFilter === 'All' || i.categoryGroup === currentFilter;
        const matchesStaffPick = currentStaffPickFilter === 'Any' || isStaffPickStudy(i);
        const matchesSide = (currentSideFilter === 'Any Side' || i.side === currentSideFilter);
        const matchesAuthor = (currentAuthorFilter === 'All Authors' || studyHasAuthor(i, currentAuthorFilter));
        const matchesTheme = currentThemeFilter === 'All Themes' || (i.themes || []).includes(currentThemeFilter);
        const matchesFavorite = (!showFavoritesOnly || renderFavorites.has(i.link));

        return matchesText && matchesOpening && matchesVariation && matchesCategory && matchesStaffPick && matchesSide && matchesAuthor && matchesTheme && matchesFavorite;
    });

    filtered = getSortedStudies(filtered, term);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const isSearchingOrFiltering = term.length > 0 || currentOpeningFilter !== 'All Openings' || currentVariationFilter !== 'All Variations' || currentFilter !== 'All' || currentStaffPickFilter !== 'Any' || currentSideFilter !== 'Any Side' || currentAuthorFilter !== 'All Authors' || currentThemeFilter !== 'All Themes' || showFavoritesOnly;
    const latestSec = document.getElementById('latestSection');
    const recentSec = document.getElementById('recentlyViewedSection');
    const featuredSec = document.getElementById('featuredSection');
    const authorSec = document.getElementById('authorProfileSection');
    const archiveHeader = document.getElementById('archiveHeader');
    const libraryControls = document.getElementById('libraryControls');
    const newSinceVisitBanner = document.getElementById('newSinceVisitBanner');
    const grid = document.getElementById('resultsGrid');
    const noRes = document.getElementById('noResults');
    const pagination = document.getElementById('paginationContainer');

    if (currentAuthor) {
        latestSec.style.display = 'none';
        recentSec?.classList.add('hidden');
        featuredSec.style.display = 'none';
        authorSec.classList.remove('hidden');
        libraryControls.classList.add('hidden');
        if (newSinceVisitBanner) newSinceVisitBanner.classList.add('hidden');
        archiveHeader.style.display = 'none';
        grid.style.display = 'none';
        noRes.style.display = 'none';
        pagination.innerHTML = '';
        const authorStudies = getSortedStudies(window.chessData.filter(study => studyHasAuthor(study, currentAuthor)), '');
        renderAuthorProfile(currentAuthor, authorStudies);
        syncUrlParams('');
        return;
    }

    authorSec.classList.add('hidden');
    libraryControls.classList.remove('hidden');
    createFilters();
    renderActiveFilters(filtered.length);

    const featured = getFeaturedStudy();
    const featuredMatchesSearch = !!featured && matchesSearch(featured, term);

    if (isSearchingOrFiltering) {
        latestSec.style.display = 'none';
        recentSec?.classList.add('hidden');
    } else {
        latestSec.style.display = 'block';
        recentSec?.classList.toggle('hidden', !window.hasRecentViews);
    }

    if (term.length > 0 && featuredMatchesSearch) {
        featuredSec.style.display = 'none';
    } else if (isSearchingOrFiltering) {
        featuredSec.style.display = 'none';
    } else {
        featuredSec.style.display = 'block';
    }
    authorSec.classList.add('hidden');
    archiveHeader.textContent = totalPages > 1 ? `Full Archive - Page ${currentPage} of ${totalPages}` : 'Full Archive';

    const counter = document.getElementById('liveCounter');
    counter.innerText = isSearchingOrFiltering
        ? `SHOWING ${filtered.length} OF ${window.chessData.length} STUDIES - PAGE ${currentPage}/${totalPages}`
        : `LIBRARY TOTAL: ${window.chessData.length}`;

    syncUrlParams(term);

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noRes.innerHTML = `
            <p class="text-lg">No studies match this library view.</p>
            <p class="text-sm mt-2 text-zinc-500">Try a broader opening, category, author, or search term.</p>
            <button onclick="resetFilters()" class="gold-accent text-[10px] mt-4 uppercase tracking-widest underline">Clear all filters</button>
        `;
        noRes.style.display = 'block';
        document.getElementById('paginationContainer').innerHTML = '';
    } else {
        grid.style.display = 'grid';
        noRes.style.display = 'none';
        grid.innerHTML = pageItems.map(i => cardHtml(i, renderFavorites)).join('');
        grid.querySelectorAll('.chess-card').forEach(el => revealObserver.observe(el));
        renderPagination(totalPages);
    }
}

function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const category = params.get('category');
    const opening = params.get('opening');
    const variation = params.get('variation');
    const side = params.get('side');
    const staff = params.get('staff');
    const author = params.get('author');
    const authorFilter = params.get('authorFilter');
    const theme = params.get('theme');
    const sort = params.get('sort');

    if (q) document.getElementById('searchInput').value = q;
    if (category === 'Staff Picks') {
        currentFilter = 'All';
        currentStaffPickFilter = 'Yes';
    } else if (category) {
        currentFilter = category;
    }
    if (opening) currentOpeningFilter = opening;
    if (variation) currentVariationFilter = variation;
    if (side) currentSideFilter = side;
    if (staff === '1' || staff === 'yes') currentStaffPickFilter = 'Yes';
    if (author) currentAuthor = cleanAuthorName(author);
    if (authorFilter) currentAuthorFilter = cleanAuthorName(authorFilter);
    if (theme) currentThemeFilter = theme;
    if (sort && document.getElementById('sortSelect')) document.getElementById('sortSelect').value = sort;
}

function syncUrlParams(term) {
    const params = new URLSearchParams();

    if (currentAuthor) {
        params.set('author', currentAuthor);
        const query = params.toString();
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        const method = pendingUrlPush ? 'pushState' : 'replaceState';
        window.history[method]({}, '', newUrl);
        pendingUrlPush = false;
        return;
    }

    if (term) params.set('q', term);
    if (currentOpeningFilter !== 'All Openings') params.set('opening', currentOpeningFilter);
    if (currentVariationFilter !== 'All Variations') params.set('variation', currentVariationFilter);
    if (currentFilter !== 'All') params.set('category', currentFilter);
    if (currentStaffPickFilter !== 'Any') params.set('staff', '1');
    if (currentSideFilter !== 'Any Side') params.set('side', currentSideFilter);
    if (currentAuthorFilter !== 'All Authors') params.set('authorFilter', currentAuthorFilter);
    if (currentThemeFilter !== 'All Themes') params.set('theme', currentThemeFilter);
    const sortValue = document.getElementById('sortSelect')?.value || 'relevance';
    if (sortValue !== 'relevance') params.set('sort', sortValue);

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    const method = pendingUrlPush ? 'pushState' : 'replaceState';
    window.history[method]({}, '', newUrl);
    pendingUrlPush = false;
}

function filterByAuthor(author) {
    currentAuthor = cleanAuthorName(author);
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    pendingUrlPush = true;
    renderArchive();
    scrollToAuthorResults();
}

function backToArchive() {
    currentAuthor = null;
    currentPage = 1;
    pendingUrlPush = true;
    renderArchive();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    currentFilter = 'All';
    currentOpeningFilter = 'All Openings';
    currentVariationFilter = 'All Variations';
    currentSideFilter = 'Any Side';
    currentStaffPickFilter = 'Any';
    currentAuthor = null;
    currentAuthorFilter = 'All Authors';
    currentThemeFilter = 'All Themes';
    currentSubFilter = null;
    currentPage = 1;
    document.getElementById('sortSelect').value = 'relevance';
    createFilters();
    renderArchive();
}

window.onscroll = function() {
    const btn = document.getElementById('toTopBtn');
    if (window.scrollY > 600) btn.classList.add('visible');
    else btn.classList.remove('visible');
};

function createFilters() {
    populateSelect('categorySelect', ['All', ...getCategoryOptions()], currentFilter);
    document.getElementById('staffSelect').value = currentStaffPickFilter;
    const openingField = document.getElementById('openingFilterField');
    const variationField = document.getElementById('variationFilterField');
    if (isOpeningCategoryGroup(currentFilter)) {
        openingField.classList.remove('hidden');
        populateSelect('openingSelect', ['All Openings', ...getFilterOptions('opening', 'opening')], currentOpeningFilter);
    } else {
        currentOpeningFilter = 'All Openings';
        openingField.classList.add('hidden');
        populateSelect('openingSelect', ['All Openings'], currentOpeningFilter);
    }
    if (isOpeningCategoryGroup(currentFilter) && currentOpeningFilter !== 'All Openings') {
        variationField.classList.remove('hidden');
        populateSelect('variationSelect', ['All Variations', ...getFilterOptions('specificOpening', 'specificOpening')], currentVariationFilter);
    } else {
        currentVariationFilter = 'All Variations';
        variationField.classList.add('hidden');
        populateSelect('variationSelect', ['All Variations'], currentVariationFilter);
    }
    populateSelect('sideSelect', ['Any Side', ...getFilterOptions('side', 'side')], currentSideFilter);
    populateSelect('authorSelect', ['All Authors', ...getAuthorOptions('author')], currentAuthorFilter);
    populateSelect('themeSelect', ['All Themes', ...getThemeOptions('theme')], currentThemeFilter);
}

function getCompatibleStudies(exclude = '') {
    const term = document.getElementById('searchInput').value.trim();
    const favorites = getFavorites();

    return window.chessData.filter(study => {
        if (exclude !== 'search' && term && !matchesSearch(study, term)) return false;
        if (exclude !== 'opening' && currentOpeningFilter !== 'All Openings' && study.opening !== currentOpeningFilter) return false;
        if (exclude !== 'specificOpening' && currentVariationFilter !== 'All Variations' && !(study.specificOpenings || [study.specificOpening]).includes(currentVariationFilter)) return false;
        if (exclude !== 'staff' && currentStaffPickFilter !== 'Any' && !isStaffPickStudy(study)) return false;
        if (exclude !== 'category' && currentFilter !== 'All') {
            if (study.categoryGroup !== currentFilter) {
                return false;
            }
        }
        if (exclude !== 'side' && currentSideFilter !== 'Any Side' && study.side !== currentSideFilter) return false;
        if (exclude !== 'author' && currentAuthorFilter !== 'All Authors' && !studyHasAuthor(study, currentAuthorFilter)) return false;
        if (exclude !== 'theme' && currentThemeFilter !== 'All Themes' && !(study.themes || []).includes(currentThemeFilter)) return false;
        if (exclude !== 'favorites' && showFavoritesOnly && !favorites.has(study.link)) return false;
        return true;
    });
}

function getFilterOptions(field, exclude = '') {
    const values = field === 'specificOpening'
        ? getCompatibleStudies(exclude).flatMap(i => i.specificOpenings || [i.specificOpening])
        : getCompatibleStudies(exclude).map(i => i[field]);
    return [...new Set(values.filter(Boolean))]
        .filter(value => !['General', 'Not Opening Specific'].includes(value))
        .sort((a, b) => a.localeCompare(b));
}

function getCategoryOptions() {
    const compatible = getCompatibleStudies('category');
    const categories = [...new Set(compatible.map(i => i.categoryGroup).filter(Boolean))]
        .filter(value => value !== 'General')
        .sort((a, b) => {
            const priority = ['Openings', 'Strategy', 'Tactics', 'Endgames', 'Puzzles', 'Games', 'Chess Variants'];
            const ai = priority.indexOf(a);
            const bi = priority.indexOf(b);
            if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            return a.localeCompare(b);
        });
    return categories;
}

function getAuthorOptions(exclude = '') {
    return [...new Set(getCompatibleStudies(exclude).flatMap(i => i.authors || [i.author]).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
}

function getThemeOptions(exclude = '') {
    return [...new Set(getCompatibleStudies(exclude).flatMap(i => i.themes || []).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
}

function populateSelect(id, options, selected) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = options.map(option => `<option value="${escapeHTML(option)}" ${option === selected ? 'selected' : ''}>${escapeHTML(option)}</option>`).join('');
}

function renderActiveFilters(resultCount) {
    const box = document.getElementById('activeFilters');
    if (!box) return;

    const term = document.getElementById('searchInput').value.trim();
    const filters = [];
    if (term) filters.push(['Search', term, 'search']);
    if (currentFilter !== 'All') filters.push(['Category', currentFilter, 'category']);
    if (currentOpeningFilter !== 'All Openings') filters.push(['Opening', currentOpeningFilter, 'opening']);
    if (currentVariationFilter !== 'All Variations') filters.push(['Variation', currentVariationFilter, 'variation']);
    if (currentStaffPickFilter !== 'Any') filters.push(['Staff Pick', 'Yes', 'staff']);
    if (currentSideFilter !== 'Any Side') filters.push(['Side', currentSideFilter, 'side']);
    if (currentAuthorFilter !== 'All Authors') filters.push(['Author', currentAuthorFilter, 'authorFilter']);
    if (currentThemeFilter !== 'All Themes') filters.push(['Theme', currentThemeFilter, 'theme']);
    if (showFavoritesOnly) filters.push(['Saved', 'My Favorites', 'favorites']);

    if (!filters.length) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }

    box.classList.remove('hidden');
    box.innerHTML = `
        <span class="filter-label">${resultCount} matching</span>
        ${filters.map(([label, value, key]) => `
            <span class="active-filter-chip brand-font">
                <span>${label}: ${escapeHTML(value)}</span>
                <button type="button" onclick="clearFilter('${key}')" aria-label="Clear ${escapeHTML(label)}">&times;</button>
            </span>
        `).join('')}
        <button type="button" onclick="resetFilters()" class="filter-chip brand-font">Clear All</button>
    `;
}

window.clearFilter = (key) => {
    if (key === 'search') document.getElementById('searchInput').value = '';
    if (key === 'opening') currentOpeningFilter = 'All Openings';
    if (key === 'variation') currentVariationFilter = 'All Variations';
    if (key === 'category') currentFilter = 'All';
    if (key === 'staff') currentStaffPickFilter = 'Any';
    if (key === 'side') currentSideFilter = 'Any Side';
    if (key === 'authorFilter') currentAuthorFilter = 'All Authors';
    if (key === 'theme') currentThemeFilter = 'All Themes';
    if (key === 'favorites') {
        showFavoritesOnly = false;
        document.getElementById('favoritesToggle').classList.remove('active');
    }
    currentPage = 1;
    createFilters();
    renderArchive();
};

window.setFilter = (cat) => {
    currentFilter = cat;
    currentAuthor = null;
    currentPage = 1;
    createFilters();
    renderArchive();
};

document.getElementById('searchInput').addEventListener('input', (e) => {
    updateSearchSuggestions(e.target.value.trim());
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        currentAuthor = null;
        currentPage = 1;
        renderArchive();
    }, 40);
});

document.addEventListener('click', (e) => {
    const box = document.getElementById('searchSuggestions');
    const input = document.getElementById('searchInput');
    if (!box.contains(e.target) && e.target !== input) {
        hideSearchSuggestions();
    }
});

document.getElementById('sortSelect').addEventListener('change', () => {
    currentPage = 1;
    renderArchive();
});

document.getElementById('openingSelect').addEventListener('change', (e) => {
    currentOpeningFilter = e.target.value;
    currentVariationFilter = 'All Variations';
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('variationSelect').addEventListener('change', (e) => {
    currentVariationFilter = e.target.value;
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('categorySelect').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    currentOpeningFilter = 'All Openings';
    currentVariationFilter = 'All Variations';
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('sideSelect').addEventListener('change', (e) => {
    currentSideFilter = e.target.value;
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('staffSelect').addEventListener('change', (e) => {
    currentStaffPickFilter = e.target.value;
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('authorSelect').addEventListener('change', (e) => {
    currentAuthorFilter = e.target.value;
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

document.getElementById('themeSelect').addEventListener('change', (e) => {
    currentThemeFilter = e.target.value;
    currentAuthor = null;
    currentPage = 1;
    renderArchive();
});

window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'endgames') {
        if (typeof showEndgameTrainer === 'function') showEndgameTrainer(false);
        return;
    }
    document.body.classList.remove('training-view');
    document.getElementById('endgameTrainerSection')?.classList.add('hidden');
    ['communityLibraryNote', 'libraryControls'].forEach(id => document.getElementById(id)?.classList.remove('hidden'));
    currentFilter = 'All';
    currentOpeningFilter = 'All Openings';
    currentVariationFilter = 'All Variations';
    currentSideFilter = 'Any Side';
    currentStaffPickFilter = 'Any';
    currentAuthor = null;
    currentAuthorFilter = 'All Authors';
    currentThemeFilter = 'All Themes';
    currentSubFilter = null;
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'relevance';
    readUrlParams();
    createFilters();
    renderArchive();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const about = document.getElementById('aboutPage');
        const submit = document.getElementById('submitPage');
        if (!about.classList.contains('hidden')) toggleAbout();
        if (!submit.classList.contains('hidden')) toggleSubmit();
        hideSearchSuggestions();
        return;
    }

    if (e.key === '/' && document.activeElement.id !== 'searchInput') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

window.addEventListener('resize', () => {
    moveCarousel(0);
});

applyStoredTheme();
loadData();
if (typeof initEndgameRoute === 'function') initEndgameRoute();
