window.ENDGAME_TRAINER_CATALOG = {
    version: 1,
    tracks: [
        {
            id: 'fundamentals',
            title: 'Fundamentals',
            description: 'Core endgames every player should be able to convert or defend with confidence.',
            categories: [
                {
                    id: 'kq-v-k',
                    title: 'King + Queen vs King',
                    objectiveType: 'convert',
                    objective: 'Win by checkmating the lone king.',
                    summary: 'Learn to restrict the king, bring your king closer, and finish without stalemating.',
                    positions: [
                        {
                            id: 'kqvk-01',
                            title: 'Central queen, active king',
                            fen: '8/8/8/8/4k3/8/3K4/3Q4 w - - 0 1',
                            sideToTrain: 'white',
                            goal: 'Checkmate black.',
                            success: 'checkmate',
                            maxMoves: 24
                        },
                        {
                            id: 'kqvk-02',
                            title: 'Box the king from distance',
                            fen: '8/8/8/5k2/8/8/2K5/Q7 w - - 0 1',
                            sideToTrain: 'white',
                            goal: 'Shrink the box, activate the king, and mate.',
                            success: 'checkmate',
                            maxMoves: 28
                        },
                        {
                            id: 'kqvk-03',
                            title: 'Avoid stalemate near the edge',
                            fen: '8/8/8/8/8/2K5/6k1/4Q3 w - - 0 1',
                            sideToTrain: 'white',
                            goal: 'Convert carefully without stalemating.',
                            success: 'checkmate',
                            maxMoves: 18
                        }
                    ]
                }
            ]
        }
    ]
};
