// Curator selections reference the library by study ID; chapter links are intentional.
const STUDY_COLLECTIONS = [
    {
        slug: 'rook-endgames',
        cover: 'assets/collections/rook-endgames.png',
        coverAlt: 'Rook Endgames: Essential Positions, with a complete rook-ending diagram',
        title: 'Rook Endgames: Essential Positions',
        curator: 'Bosburp',
        description: 'Three selected Lichess studies for learning rook endings, practising key positions, and exploring rook and bishop versus rook.',
        introduction: 'I\'ve picked three studies to help you work on rook endings. Start with the basics, try the positions yourself, and save rook and bishop versus rook for when you want a tougher challenge.',
        guidance: 'The last study includes a bishop as well as rooks, so I\'d treat it as a step beyond the basic rook endings.',
        groups: [
            { title: 'A suggested study order', entries: [
                { link: 'https://lichess.org/study/bnboDhFM', note: 'Start here for Philidor and Lucena, then work through Vancura and test yourself with the exercises.' },
                { link: 'https://lichess.org/study/7UUxD0rK/hNYicO4r', note: 'Another rook-endgame study I\'d recommend alongside the first one.' },
                { link: 'https://lichess.org/study/wyDD6Zrb/5ATjwRK5', note: 'For a tougher challenge, try rook and bishop versus rook. Study the winning techniques, but pay just as much attention to the defensive resources.' }
            ] }
        ]
    },
    {
        slug: 'bosburp-opening-repertoire',
        title: "Bosburp's Opening Repertoire Recommendations",
        curator: 'Bosburp',
        description: 'Bosburp\'s White repertoire recommendations: opening studies grouped by your first move and Black\'s defence, with practical style and level guidance.',
        introduction: 'These are my recommendations for building a White repertoire. I love aggressive, tactical openings, but I\'ve included some quieter options too. Pick a main opening you enjoy, then choose what to play against each of Black\'s defences.',
        guidance: 'The levels are my rough guide to who each study suits, not strict rating cutoffs. For now, these are my White recommendations.',
        groups: [
            { title: 'Choose your main opening', entries: [
                { link: 'https://lichess.org/study/poUncbgN/bBdWDt8T', label: 'Italian Game and Fried Liver', level: 'Beginner', note: 'New to the Italian? Start here with the basics and the Fried Liver attack.' },
                { link: 'https://lichess.org/study/xeJWiWcZ', label: 'Italian Game: in depth', level: 'Beginner+', note: 'If you want to go deeper into the Italian, this is a really thorough guide. A sound choice from beginner level onwards.' },
                { link: 'https://lichess.org/study/J3Vkt5pj', label: 'Scotch Gambit', level: 'Intermediate+', note: 'Aggressive yet sound. I\'d recommend the Scotch Gambit if you want active pieces and attacking chances right from the opening.' },
                { link: 'https://lichess.org/study/ACmyH8gC', label: "King's Gambit", level: 'Intermediate+', note: 'Hyper-aggressive and very tactical. More risk, but plenty of chances to make things difficult for your opponent.' },
                { link: 'https://lichess.org/study/GsgWTTgK', label: 'Vienna Game', level: 'Intermediate+', note: 'Sound, trappy and very attacking. A great option if that is the kind of game you enjoy.' },
                { link: 'https://lichess.org/study/jTcC0b7Q', label: 'Bird Opening', level: 'Intermediate+', note: 'Rare, aggressive and relatively low on theory. I\'d consider the Bird if you want something different without learning mountains of lines.' },
                { link: 'https://lichess.org/study/YqTNWVpm/NwndNy4J', label: 'Bird Opening: further study', level: 'Intermediate+', note: 'Another Bird study I\'d include if you decide to build your repertoire around 1.f4.' },
                { link: 'https://lichess.org/study/9EQXkJUQ/NVeNCUBO', label: 'Bird Opening: additional ideas', level: 'Intermediate+', note: 'One more Bird recommendation to explore alongside the other two.' },
                { link: 'https://lichess.org/study/YR5hkdQ6', label: "Bishop's Opening", level: 'Intermediate+', note: 'Very aggressive, full of traps and incredibly fun. One to look at if you enjoy attacking chess.' },
                { link: 'https://lichess.org/study/xvvEczVE', label: 'Italian Game with the Evans Gambit', level: 'Intermediate+', note: 'Want a sharper Italian? Try the Evans Gambit. This is my recommendation for a more aggressive approach.' },
                { link: 'https://lichess.org/study/0uRBskUV', label: "Queen's Gambit", level: 'Late intermediate+; recommended for advanced players', note: 'More positional, slower and very sound. I\'d especially recommend this to advanced players, or late intermediates ready for that kind of game.' }
            ] },
            { title: 'Against the Caro-Kann', entries: [
                { link: 'https://lichess.org/study/CfSYkcMp/MbZBHdrl', label: 'Three practical choices', level: 'Early intermediate', note: 'Three simpler choices against the Caro-Kann. Pick the one that fits your style.' },
                { link: 'https://lichess.org/study/64DHMYix', label: 'Two Knights Attack', level: 'Late intermediate', note: 'My full, in-depth Two Knights Attack repertoire. Very aggressive while keeping a sound foundation. I\'d recommend it from late intermediate level.' },
                { link: 'https://lichess.org/study/3hqd8btt', label: 'Dinic Gambit', note: 'An easy-to-pick-up blitz weapon with loads of traps. Great for creating practical problems.' }
            ] },
            { title: 'Against the French', entries: [
                { link: 'https://lichess.org/study/Rb4AyiUo', label: 'Two Knights Variation', level: 'Intermediate+', note: 'Aggressive, rare and tactical. My recommendation if you want to meet the French with the Two Knights.' },
                { link: 'https://lichess.org/study/YV3uV1Ry/VJgHlKeD', label: 'Schlechter Variation', note: 'For a more solid approach against the French that still gives you attacking chances, I\'d look at the Schlechter.' },
                { link: 'https://lichess.org/study/B0VjjEXy/VcxOCDdg', label: 'Schlechter Variation: companion study', note: 'I\'d use this alongside the other Schlechter study to explore the variation further.' }
            ] },
            { title: 'Against the Philidor', entries: [
                { link: 'https://lichess.org/study/0wRf6tr3', label: 'Bird Gambit', note: 'My full Bird Gambit against the Philidor. Very aggressive and tactical, with some wild attacks, including a variation with a \'zombie\' king walk!' }
            ] },
            { title: 'Against the Sicilian', entries: [
                { link: 'https://lichess.org/study/PXLXY0L8/JKGriiGB', label: 'Grand Prix Attack', level: 'Intermediate', note: 'An aggressive attacking system without too much theory. Look through the games to understand the ideas, rather than just memorising moves.' },
                { link: 'https://lichess.org/study/cZkEoadL', label: 'Mengarini Variation', level: 'Intermediate', note: 'Very rare, aggressive and full of traps. Worth a look if you want to surprise Sicilian players.' },
                { link: 'https://lichess.org/study/OKdcaypC', label: 'Froster Gambit', level: 'Intermediate', note: 'Another rare, trappy gambit I\'d recommend for intermediate players.' },
                { link: 'https://lichess.org/study/mH6W56xr', label: 'Carlsen Sicilian', level: 'Late intermediate', note: 'A slower burn: castle queenside and build an attack against the kingside. I\'d recommend this if you enjoy a more patient attacking game.' },
                { link: 'https://lichess.org/study/55CPbtmd', label: "Bosburp's Portsmouth Gambit", level: 'Late intermediate+', note: 'My favourite weapon against the ...Nc6 Sicilian. Extremely rare and aggressive, with wild tactical sacrifices, including a full rook sacrifice in the main line.' },
                { link: 'https://lichess.org/study/Vpb6r3Wq', label: 'Against the ...d6 Sicilian', note: 'My recommendation against the ...d6 Sicilian if you want a rare line with plenty of traps.' },
                { link: 'https://lichess.org/study/RP1MIzYg', label: 'Wing Gambit against ...e6', note: 'Try the Wing Gambit against the ...e6 Sicilian. You can also use these ideas against the French.' }
            ] },
            { title: 'Against other defences', entries: [
                { link: 'https://lichess.org/study/aZe5XdwW', label: 'Modern Defense: flank attacks', note: 'Against the Modern, I\'d go for these flank-attacking ideas.' },
                { link: 'https://lichess.org/study/DDSdbgcf', label: 'Nimzowitsch Defense: flank attacks', note: 'For the Nimzowitsch Defense, here\'s another study focused on flank attacks.' },
                { link: 'https://lichess.org/study/xJSRd5Pk/OjhoeeAo', label: 'Against the Scandinavian', level: 'Intermediate', note: 'My intermediate-level pick against the Scandinavian.' },
                { link: 'https://lichess.org/study/OKcZjFq2/y3dBcHYf', label: 'Against the Scandinavian: an accessible option', level: 'Beginner+', note: 'For a more beginner-friendly option against the Scandinavian, I\'d start here.' },
                { link: 'https://lichess.org/study/fSi98DJ4', label: 'Alekhine Defense: Samisch Attack', level: 'Intermediate+', note: 'A full, in-depth Samisch Attack repertoire against the Alekhine. I\'d recommend it for intermediates, but beginners can learn a lot from it too.' }
            ] }
        ]
    }
];
