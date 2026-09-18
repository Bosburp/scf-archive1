// Curator selections reference the library by study ID; chapter links are intentional.
const STUDY_COLLECTIONS = [
    {
        slug: 'rook-endgames',
        title: 'Rook Endgames: Essential Positions',
        curator: 'Bosburp',
        description: 'Three selected Lichess studies for learning rook endings, practising key positions, and exploring rook and bishop versus rook.',
        introduction: 'Start with the fundamental rook endings, work through the second selection, then explore the specialist rook-and-bishop ending. Try the positions on a board before reading the continuation, and return to the ones you find difficult.',
        guidance: 'The final selection includes a bishop as well as rooks: it is an extension of the collection, rather than a basic rook-and-pawn lesson.',
        groups: [
            { title: 'A suggested study order', entries: [
                { link: 'https://lichess.org/study/bnboDhFM', note: 'Start here for the Philidor and Lucena positions, then move on to the Vancura position and the study\'s exercises.' },
                { link: 'https://lichess.org/study/7UUxD0rK/hNYicO4r', note: 'Continue with Bosburp\'s second rook-endgame selection. This link opens the specific chapter selected for the collection.' },
                { link: 'https://lichess.org/study/wyDD6Zrb/5ATjwRK5', note: 'Explore rook and bishop versus rook, including winning techniques and defensive resources. Open the selected chapter after studying the fundamental rook endings.' }
            ] }
        ]
    },
    {
        slug: 'bosburp-opening-repertoire',
        title: "Bosburp's Opening Repertoire Recommendations",
        curator: 'Bosburp',
        description: 'Bosburp\'s White repertoire recommendations: opening studies grouped by your first move and Black\'s defence, with practical style and level guidance.',
        introduction: 'A personal selection for building a White repertoire, with a preference for active play, tactical chances and practical surprises. Choose one main opening, then add a response to each defence you regularly face. You do not need to learn every alternative.',
        guidance: 'White repertoire, curated by Bosburp. Levels and playing styles reflect his recommendations; level labels are broad guides rather than fixed rating bands.',
        groups: [
            { title: 'Choose your main opening', entries: [
                { link: 'https://lichess.org/study/poUncbgN/bBdWDt8T', label: 'Italian Game and Fried Liver', level: 'Beginner', note: 'A first route into the Italian Game and the attacking ideas of the Fried Liver.' },
                { link: 'https://lichess.org/study/xeJWiWcZ', label: 'Italian Game: in depth', level: 'Beginner+', note: 'A fuller Italian repertoire for players who want a sound foundation and more depth.' },
                { link: 'https://lichess.org/study/J3Vkt5pj', label: 'Scotch Gambit', level: 'Intermediate+', note: 'An aggressive choice that Bosburp recommends for combining active development with a sound attacking foundation.' },
                { link: 'https://lichess.org/study/ACmyH8gC', label: "King's Gambit", level: 'Intermediate+', note: 'A highly aggressive, tactical choice with more risk and practical attacking opportunities.' },
                { link: 'https://lichess.org/study/GsgWTTgK', label: 'Vienna Game', level: 'Intermediate+', note: 'An attacking repertoire with tactical traps and a sound positional starting point.' },
                { link: 'https://lichess.org/study/jTcC0b7Q', label: 'Bird Opening', level: 'Intermediate+', note: 'An unusual, aggressive alternative. Bosburp recommends it for a relatively low-theory repertoire.' },
                { link: 'https://lichess.org/study/YqTNWVpm/NwndNy4J', label: 'Bird Opening: further study', level: 'Intermediate+', note: 'A companion Bird Opening selection, opening directly at Bosburp\'s chosen chapter.' },
                { link: 'https://lichess.org/study/9EQXkJUQ/NVeNCUBO', label: 'Bird Opening: additional ideas', level: 'Intermediate+', note: 'Another selected chapter to expand the same Bird Opening repertoire.' },
                { link: 'https://lichess.org/study/YR5hkdQ6', label: "Bishop's Opening", level: 'Intermediate+', note: 'A very aggressive, trap-rich option that Bosburp particularly recommends for enjoyable attacking games.' },
                { link: 'https://lichess.org/study/xvvEczVE', label: 'Italian Game with the Evans Gambit', level: 'Intermediate+', note: 'An ambitious Italian choice for players who want sharper gambit play and attacking positions.' },
                { link: 'https://lichess.org/study/0uRBskUV', label: "Queen's Gambit", level: 'Late intermediate+; recommended for advanced players', note: 'A more positional alternative, with slower play and a strong emphasis on a sound structure.' }
            ] },
            { title: 'Against the Caro-Kann', entries: [
                { link: 'https://lichess.org/study/CfSYkcMp/MbZBHdrl', label: 'Three practical choices', level: 'Early intermediate', note: 'Choose from three simpler approaches according to the positions and style you enjoy.' },
                { link: 'https://lichess.org/study/64DHMYix', label: 'Two Knights Attack', level: 'Late intermediate', note: 'An in-depth anti-Caro-Kann repertoire. Bosburp recommends it as a sound route to highly aggressive play.' },
                { link: 'https://lichess.org/study/3hqd8btt', label: 'Dinic Gambit', note: 'A practical blitz weapon with many traps and an easy-to-adopt attacking approach.' }
            ] },
            { title: 'Against the French', entries: [
                { link: 'https://lichess.org/study/Rb4AyiUo', label: 'Two Knights Variation', level: 'Intermediate+', note: 'An uncommon, aggressive choice with a tactical character.' },
                { link: 'https://lichess.org/study/YV3uV1Ry/VJgHlKeD', label: 'Schlechter Variation', note: 'Bosburp\'s more solid alternative against the French, while retaining aggressive intentions.' },
                { link: 'https://lichess.org/study/B0VjjEXy/VcxOCDdg', label: 'Schlechter Variation: companion study', note: 'A second selected chapter for exploring the same approach against the French.' }
            ] },
            { title: 'Against the Philidor', entries: [
                { link: 'https://lichess.org/study/0wRf6tr3', label: 'Bird Gambit', note: 'Bosburp\'s highly aggressive recommendation: tactical attacks, sacrifices and unusual king walks. Work through the forcing lines carefully.' }
            ] },
            { title: 'Against the Sicilian', entries: [
                { link: 'https://lichess.org/study/PXLXY0L8/JKGriiGB', label: 'Grand Prix Attack', level: 'Intermediate', note: 'An attacking system with less theory to memorise. Use the games to understand the recurring plans.' },
                { link: 'https://lichess.org/study/cZkEoadL', label: 'Mengarini Variation', level: 'Intermediate', note: 'A very uncommon, aggressive variation with practical traps.' },
                { link: 'https://lichess.org/study/OKdcaypC', label: 'Froster Gambit', level: 'Intermediate', note: 'A rare gambit choice for players who enjoy tactical traps.' },
                { link: 'https://lichess.org/study/mH6W56xr', label: 'Carlsen Sicilian', level: 'Late intermediate', note: 'A slower attacking approach. Bosburp highlights queenside castling and a gradual kingside attack.' },
                { link: 'https://lichess.org/study/55CPbtmd', label: "Bosburp's Portsmouth Gambit", level: 'Late intermediate+', note: 'Bosburp\'s favourite weapon against the ...Nc6 Sicilian: rare, highly tactical play, including a rook sacrifice in the main line.' },
                { link: 'https://lichess.org/study/Vpb6r3Wq', label: 'Against the ...d6 Sicilian', note: 'An uncommon line chosen for its practical traps.' },
                { link: 'https://lichess.org/study/RP1MIzYg', label: 'Wing Gambit against ...e6', note: 'A gambit option against the ...e6 Sicilian, with related ideas against the French.' }
            ] },
            { title: 'Against other defences', entries: [
                { link: 'https://lichess.org/study/aZe5XdwW', label: 'Modern Defense: flank attacks', note: 'Explore flank attacks against the Modern Defense.' },
                { link: 'https://lichess.org/study/DDSdbgcf', label: 'Nimzowitsch Defense: flank attacks', note: 'A flank-attacking approach against the Nimzowitsch Defense.' },
                { link: 'https://lichess.org/study/xJSRd5Pk/OjhoeeAo', label: 'Against the Scandinavian', level: 'Intermediate', note: 'Bosburp\'s intermediate recommendation, starting at the selected chapter.' },
                { link: 'https://lichess.org/study/OKcZjFq2/y3dBcHYf', label: 'Against the Scandinavian: an accessible option', level: 'Beginner+', note: 'An alternative starting point for players earlier in their opening study.' },
                { link: 'https://lichess.org/study/fSi98DJ4', label: 'Alekhine Defense: Samisch Attack', level: 'Intermediate+', note: 'An in-depth repertoire that Bosburp also recommends to beginners for its educational value.' }
            ] }
        ]
    }
];
