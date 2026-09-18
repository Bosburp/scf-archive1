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
        cover: 'assets/collections/bosburp-opening-repertoire.png',
        coverAlt: "Bosburp's Opening Recommendations, with his Discord portrait and reading character",
        title: "Bosburp's White Repertoire Recommendations",
        curator: 'Bosburp',
        description: 'Bosburp\'s White repertoire recommendations: opening studies grouped by your first move and Black\'s defence, with practical style and level guidance.',
        introduction: 'These are my recommendations for building a White repertoire. I love aggressive, tactical openings, but I\'ve included some quieter options too. Pick a main opening you enjoy, then choose what to play against each of Black\'s defences.',
        guidance: 'The levels are my rough guide to who each study suits, not strict rating cutoffs. These are my White recommendations; see the Black collection for the other side of your repertoire.',
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
    },
    {
        slug: 'bosburp-black-repertoire',
        title: "Bosburp's Black Repertoire Recommendations",
        curator: 'Bosburp',
        description: 'My Black repertoire recommendations against 1.e4, 1.d4 and flank openings, with personal style advice and study suggestions from beginner-friendly choices to advanced theory.',
        introduction: 'These are my picks for building a Black repertoire. I love tricky, aggressive positions, but you do not have to play that way. Start by choosing a defence against 1.e4 and 1.d4 that you enjoy, then fill in the gaps against the other systems.',
        guidance: 'The levels and style descriptions are my personal recommendations, not strict rating cutoffs or engine assessments. A practical blitz weapon is not necessarily what I would choose for a classical game. Pick alternatives that fit together rather than trying to learn everything here.',
        groups: [
            { title: 'Against 1.e4: French and Caro-Kann foundations', entries: [
                { link: 'https://lichess.org/study/spty8Dc9', label: 'French Defense: the complete guide', level: 'Advanced study; a defence to explore from late beginner level', note: 'For late beginners, I would try both the French and the Caro-Kann, then pick the one you enjoy. I used to play the French and loved it: solid, but with some very aggressive ways to play. This particular study is more advanced and very complete.' },
                { link: 'https://lichess.org/study/Fmk4fYJp', label: 'French Defense: a simpler, aggressive approach', level: 'Late beginner+', note: 'If the full French study feels like too much, start with this simpler option. This is the more aggressive style I would look at first.' },
                { link: 'https://lichess.org/study/oWZx54ef', label: 'Caro-Kann: full repertoire', level: 'Late beginner+', note: 'A solid, powerful alternative to the French. One thing I like is being able to develop the light-squared bishop before closing it in. This is my full-repertoire pick.' },
                { link: 'https://lichess.org/study/8isfzJc8', label: 'Caro-Kann: an accessible guide', level: 'Late beginner+', note: 'Another full guide I would recommend for the Caro-Kann, especially if you want something easy to follow while you get comfortable with the defence.' }
            ] },
            { title: 'Against 1.e4: active alternatives and open games', entries: [
                { link: 'https://lichess.org/study/dJQzdsfb', label: 'Scandinavian: 2...Nc6', level: 'Intermediate+', note: 'For players who love tactical, very aggressive openings, this Scandinavian approach with 2...Nc6 is a fantastic option to explore.' },
                { link: 'https://lichess.org/study/bZOUIzL2', label: 'A full guide to 1.e4 e5', level: 'Late intermediate+', note: 'Meeting 1.e4 with 1...e5 can be a very good choice, but be ready to study carefully. You are often walking into White\'s preparation, so I would take the theory seriously. This is my full-guide recommendation.' },
                { link: 'https://lichess.org/study/artxS9bL', label: 'Nimzowitsch Defense', level: 'Intermediate+', note: 'My personal favourite for an aggressive Black repertoire. I love how unusual 1...Nc6 is and how tricky it can be to face. This is the one I would try if you enjoy surprising your opponents.' }
            ] },
            { title: 'Against 1.e4: choose your Sicilian', entries: [
                { link: 'https://lichess.org/study/d8vKHXnC', label: 'Accelerated Dragon', level: 'Intermediate', note: 'If you want to play the Sicilian, I would look at the Accelerated Dragon first. To me, it is one of the more accessible ways in, with the active play I enjoy.' },
                { link: 'https://lichess.org/study/lmE5iSRC', label: "O'Kelly Sicilian", level: 'Intermediate', note: 'Another Sicilian I like for intermediate players. The O\'Kelly can be a nice surprise if you want to take your opponent somewhere less familiar.' },
                { link: 'https://lichess.org/study/WV5BQOvt', label: 'Najdorf Sicilian', level: 'Advanced', note: 'For a more classical, traditional Sicilian choice, there is the Najdorf. I would reserve this recommendation for advanced players who genuinely enjoy studying a lot of theory.' }
            ] },
            { title: 'Against 1.d4: choose a foundation', entries: [
                { link: 'https://lichess.org/study/8mtnMdsO', label: 'Dutch Defense', level: 'Beginner+', note: 'The Dutch is my suggestion if you want a broadly usable system against 1.d4. I like the mix of a clear setup and aggressive possibilities, without starting with a huge theoretical workload.' },
                { link: 'https://lichess.org/study/NutHq1Cx/6Eq6oANy', label: 'Budapest Gambit', level: 'Early intermediate', note: 'For a more daring approach against 1.d4 and 2.c4, try the Budapest. I enjoy its aggressive character, although prepared opponents can steer it into more positional lines. At higher levels, I find that takes away some of the fun.' },
                { link: 'https://lichess.org/study/sJVldGJL/E9Q9PBpz', label: "King's Indian Defense", level: 'Late intermediate+', note: 'The King\'s Indian is another defence I really like from late intermediate level onwards. This is my first recommendation if you want to explore it.' },
                { link: 'https://lichess.org/study/9XAhbaE7', label: "King's Indian: an easier full guide", note: 'For an easier route into the King\'s Indian, I would use this full guide alongside the first recommendation.' },
                { link: 'https://lichess.org/study/hEPV1nVh', label: "King's Indian: the most approachable starting point", note: 'Of these King\'s Indian studies, this is the one I would start with if you want the most beginner-friendly explanation. That does not mean you have to learn a full King\'s Indian repertoire immediately.' },
                { link: 'https://lichess.org/study/gxTkmYQU', label: "Albin Countergambit against the Queen's Gambit", note: 'A nice aggressive option against the Queen\'s Gambit. I like the Albin when I want to give White something tricky to deal with early on.' }
            ] },
            { title: 'Against the London and Jobava London', entries: [
                { link: 'https://lichess.org/study/PV67RqMx', label: 'Anti-London: an intermediate option', level: 'Intermediate', note: 'Not in the mood to let White play a comfortable London setup? This is my intermediate recommendation for meeting it.' },
                { link: 'https://lichess.org/study/bsLwjNBX', label: 'Anti-London: a beginner-friendly option', level: 'Beginner+', note: 'For a more beginner-friendly answer to the London, I would start here.' },
                { link: 'https://lichess.org/study/HwcpcnXo/3BIeAqfg', label: 'Against the Jobava London', note: 'Keep an answer to the Jobava London in your repertoire too. This is the study and chapter I would use for it.' },
                { link: 'https://lichess.org/study/0hjkNe91', label: 'Hartlaub-Charlick Gambit: a blitz alternative', note: 'If you really want to avoid a normal London game, this is my offbeat blitz suggestion. It belongs to the Englund family, but it is this particular gambit I am recommending, not the usual Englund lines. I see it as a practical surprise weapon, especially below 2000, not my first choice for classical over-the-board chess or a promise of results.' }
            ] },
            { title: 'Against 1.d4: advanced theoretical repertoires', entries: [
                { link: 'https://lichess.org/study/8l7u1jBt', label: 'Nimzo-Vienna repertoire', level: 'Advanced', note: 'For advanced players ready for a more theoretical repertoire against 1.d4, I would look at this Nimzo-Vienna recommendation.' },
                { link: 'https://lichess.org/study/HlS091Xs', label: 'A deeper theoretical option against 1.d4', level: 'Very advanced', note: 'This is the more demanding recommendation. I would save it for players who want to go deeply into theory and are happy to put in the work.' }
            ] },
            { title: 'Complete the repertoire: other systems', entries: [
                { link: 'https://lichess.org/study/V7l41WdC/IF4omPHp', label: 'Against the Colle', level: 'Intermediate', note: 'My recommendation for dealing with the Colle. Add this once you have settled on your main answer to 1.d4.' },
                { link: 'https://lichess.org/study/m2ovNEWF/w4XIK8sf', label: 'Against the English', level: 'Intermediate', note: 'For an answer to the English, this is the study I would work through.' },
                { link: 'https://lichess.org/study/qpTWyTks', label: 'Horsefly Defense against the Bird', level: 'Intermediate+', note: 'My favourite answer to the Bird. The Horsefly is one I would definitely learn if you enjoy the kinds of openings I recommend.' },
                { link: 'https://lichess.org/study/P7O9jus3/JJMzE5Jl', label: "Spassky Variation against the King's Indian Attack", note: 'Against the King\'s Indian Attack, I would go with the Spassky Variation. Start with this chapter.' }
            ] }
        ]
    }
];
