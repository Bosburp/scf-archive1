(function () {
    const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const PIECES = {
        K: '&#9812;',
        Q: '&#9813;',
        k: '&#9818;'
    };

    const state = {
        categoryId: 'kq-v-k',
        positionIndex: 0,
        selected: null,
        board: null,
        turn: 'w',
        moveCount: 0,
        status: 'ready',
        message: ''
    };

    function trainerStorageKey(positionId) {
        return `future-endgame-trainer:${positionId}`;
    }

    function getCatalog() {
        return window.ENDGAME_TRAINER_CATALOG || { tracks: [] };
    }

    function getCategories() {
        return getCatalog().tracks.flatMap(track => track.categories.map(category => ({ ...category, trackTitle: track.title })));
    }

    function getCurrentCategory() {
        return getCategories().find(category => category.id === state.categoryId) || getCategories()[0];
    }

    function getCurrentPosition() {
        const category = getCurrentCategory();
        return category.positions[state.positionIndex] || category.positions[0];
    }

    function parseFen(fen) {
        const [layout, turn = 'w'] = fen.split(/\s+/);
        const board = {};
        layout.split('/').forEach((row, rankIndex) => {
            let fileIndex = 0;
            for (const char of row) {
                if (/\d/.test(char)) {
                    fileIndex += Number(char);
                } else {
                    const square = `${FILES[fileIndex]}${8 - rankIndex}`;
                    board[square] = char;
                    fileIndex += 1;
                }
            }
        });
        return { board, turn };
    }

    function squareToCoords(square) {
        return { file: FILES.indexOf(square[0]), rank: Number(square[1]) - 1 };
    }

    function coordsToSquare(file, rank) {
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return `${FILES[file]}${rank + 1}`;
    }

    function pieceColor(piece) {
        if (!piece) return null;
        return piece === piece.toUpperCase() ? 'w' : 'b';
    }

    function findKing(board, color) {
        const target = color === 'w' ? 'K' : 'k';
        return Object.keys(board).find(square => board[square] === target);
    }

    function kingsAdjacent(board) {
        const white = findKing(board, 'w');
        const black = findKing(board, 'b');
        if (!white || !black) return false;
        const a = squareToCoords(white);
        const b = squareToCoords(black);
        return Math.max(Math.abs(a.file - b.file), Math.abs(a.rank - b.rank)) <= 1;
    }

    function isLineClear(board, from, to) {
        const a = squareToCoords(from);
        const b = squareToCoords(to);
        const stepFile = Math.sign(b.file - a.file);
        const stepRank = Math.sign(b.rank - a.rank);
        let file = a.file + stepFile;
        let rank = a.rank + stepRank;
        while (file !== b.file || rank !== b.rank) {
            if (board[coordsToSquare(file, rank)]) return false;
            file += stepFile;
            rank += stepRank;
        }
        return true;
    }

    function attacksSquare(board, from, to) {
        const piece = board[from];
        if (!piece) return false;
        const a = squareToCoords(from);
        const b = squareToCoords(to);
        const df = Math.abs(a.file - b.file);
        const dr = Math.abs(a.rank - b.rank);
        if (piece.toUpperCase() === 'K') return Math.max(df, dr) === 1;
        if (piece.toUpperCase() === 'Q') return (df === dr || df === 0 || dr === 0) && isLineClear(board, from, to);
        return false;
    }

    function isInCheck(board, color) {
        const kingSquare = findKing(board, color);
        if (!kingSquare) return false;
        return Object.keys(board).some(square => pieceColor(board[square]) !== color && attacksSquare(board, square, kingSquare));
    }

    function rawPieceMoveOk(board, from, to) {
        const piece = board[from];
        const target = board[to];
        if (!piece || !to || target && pieceColor(target) === pieceColor(piece)) return false;
        if (target && target.toUpperCase() === 'K') return false;
        const a = squareToCoords(from);
        const b = squareToCoords(to);
        const df = Math.abs(a.file - b.file);
        const dr = Math.abs(a.rank - b.rank);
        if (piece.toUpperCase() === 'K') return Math.max(df, dr) === 1;
        if (piece.toUpperCase() === 'Q') return (df === dr || df === 0 || dr === 0) && isLineClear(board, from, to);
        return false;
    }

    function applyMove(board, from, to) {
        const next = { ...board };
        next[to] = next[from];
        delete next[from];
        return next;
    }

    function legalMoves(board, color) {
        const moves = [];
        Object.keys(board).forEach(from => {
            if (pieceColor(board[from]) !== color) return;
            for (let file = 0; file < 8; file += 1) {
                for (let rank = 0; rank < 8; rank += 1) {
                    const to = coordsToSquare(file, rank);
                    if (from === to || !rawPieceMoveOk(board, from, to)) continue;
                    const next = applyMove(board, from, to);
                    if (!kingsAdjacent(next) && !isInCheck(next, color)) moves.push({ from, to });
                }
            }
        });
        return moves;
    }

    function isCheckmate(board, color) {
        return isInCheck(board, color) && legalMoves(board, color).length === 0;
    }

    function isStalemate(board, color) {
        return !isInCheck(board, color) && legalMoves(board, color).length === 0;
    }

    function boardToFen(board, turn) {
        const rows = [];
        for (let rank = 7; rank >= 0; rank -= 1) {
            let empty = 0;
            let row = '';
            for (let file = 0; file < 8; file += 1) {
                const piece = board[coordsToSquare(file, rank)];
                if (!piece) {
                    empty += 1;
                } else {
                    if (empty) row += empty;
                    row += piece;
                    empty = 0;
                }
            }
            if (empty) row += empty;
            rows.push(row);
        }
        return `${rows.join('/')} ${turn} - - 0 1`;
    }

    function distanceToCenter(square) {
        const { file, rank } = squareToCoords(square);
        return Math.abs(file - 3.5) + Math.abs(rank - 3.5);
    }

    function chooseOpponentMove(board) {
        const moves = legalMoves(board, 'b');
        if (!moves.length) return null;
        return moves
            .map(move => {
                const next = applyMove(board, move.from, move.to);
                const score = (isInCheck(next, 'b') ? -100 : 0) + distanceToCenter(move.to);
                return { move, score };
            })
            .sort((a, b) => b.score - a.score)[0].move;
    }

    function loadPosition(index = state.positionIndex) {
        const category = getCurrentCategory();
        state.positionIndex = Math.max(0, Math.min(index, category.positions.length - 1));
        const position = getCurrentPosition();
        const parsed = parseFen(position.fen);
        state.board = parsed.board;
        state.turn = parsed.turn;
        state.selected = null;
        state.moveCount = 0;
        state.status = 'playing';
        state.message = position.goal;
        renderTrainer();
    }

    function saveResult(position, result) {
        const previous = readProgress(position.id);
        const attempts = (previous.attempts || 0) + 1;
        const bestMoves = result.success
            ? Math.min(previous.bestMoves || Infinity, state.moveCount)
            : previous.bestMoves || null;
        const payload = {
            attempts,
            successes: (previous.successes || 0) + (result.success ? 1 : 0),
            mistakes: (previous.mistakes || 0) + (result.mistake ? 1 : 0),
            mastered: Boolean(result.success && attempts >= 2),
            bestMoves,
            updatedAt: new Date().toISOString()
        };
        try { localStorage.setItem(trainerStorageKey(position.id), JSON.stringify(payload)); } catch (e) {}
    }

    function readProgress(positionId) {
        try {
            return JSON.parse(localStorage.getItem(trainerStorageKey(positionId)) || '{}');
        } catch (e) {
            return {};
        }
    }

    function handleSquare(square) {
        if (state.status !== 'playing' || state.turn !== 'w') return;
        const piece = state.board[square];
        if (!state.selected) {
            if (piece && pieceColor(piece) === 'w') {
                state.selected = square;
                renderTrainer();
            }
            return;
        }
        if (state.selected === square) {
            state.selected = null;
            renderTrainer();
            return;
        }
        const move = legalMoves(state.board, 'w').find(candidate => candidate.from === state.selected && candidate.to === square);
        if (!move) {
            state.message = 'That move is not legal in this position.';
            state.selected = pieceColor(piece) === 'w' ? square : null;
            renderTrainer();
            return;
        }
        state.board = applyMove(state.board, move.from, move.to);
        state.moveCount += 1;
        state.selected = null;
        state.turn = 'b';
        const position = getCurrentPosition();
        if (isCheckmate(state.board, 'b')) {
            state.status = 'complete';
            state.message = 'Checkmate. Position converted.';
            saveResult(position, { success: true });
            renderTrainer();
            return;
        }
        if (isStalemate(state.board, 'b')) {
            state.status = 'complete';
            state.message = 'Stalemate. Good technique avoids taking away every escape too early.';
            saveResult(position, { success: false, mistake: true });
            renderTrainer();
            return;
        }
        if (state.moveCount >= position.maxMoves) {
            state.status = 'complete';
            state.message = 'Move limit reached. Retry and aim to restrict the king faster.';
            saveResult(position, { success: false, mistake: true });
            renderTrainer();
            return;
        }
        const reply = chooseOpponentMove(state.board);
        if (reply) {
            state.board = applyMove(state.board, reply.from, reply.to);
            state.message = position.goal;
        }
        state.turn = 'w';
        renderTrainer();
    }

    function renderBoard() {
        const selected = state.selected;
        let html = '';
        for (let rank = 7; rank >= 0; rank -= 1) {
            for (let file = 0; file < 8; file += 1) {
                const square = coordsToSquare(file, rank);
                const piece = state.board?.[square] || '';
                const dark = (file + rank) % 2 === 0;
                html += `
                    <button type="button" class="trainer-square ${dark ? 'is-dark' : 'is-light'} ${selected === square ? 'selected' : ''}" data-square="${square}" aria-label="${square}${piece ? ` ${piece}` : ''}">
                        <span class="trainer-piece">${PIECES[piece] || ''}</span>
                        <span class="trainer-coord">${square}</span>
                    </button>
                `;
            }
        }
        return html;
    }

    function progressSummary(category) {
        const totals = category.positions.reduce((acc, position) => {
            const progress = readProgress(position.id);
            acc.attempts += progress.attempts || 0;
            acc.successes += progress.successes || 0;
            if (progress.mastered) acc.mastered += 1;
            return acc;
        }, { attempts: 0, successes: 0, mastered: 0 });
        return totals;
    }

    function renderTrainer() {
        const root = document.getElementById('endgameTrainerSection');
        if (!root) return;
        const category = getCurrentCategory();
        const position = getCurrentPosition();
        if (!state.board) {
            const parsed = parseFen(position.fen);
            state.board = parsed.board;
            state.turn = parsed.turn;
            state.message = position.goal;
        }
        const progress = progressSummary(category);
        const currentProgress = readProgress(position.id);
        root.innerHTML = `
            <section class="trainer-hero">
                <button type="button" class="back-btn" onclick="showCommunityLibrary()">Back to Community Library</button>
                <p class="section-meta">Train</p>
                <h2>Endgame Trainer</h2>
                <p>Practice theoretical endgames by playing them out. This first foundation track is separate from the free community study library and is built to grow into a full training product.</p>
            </section>
            <div class="trainer-layout">
                <aside class="trainer-sidebar">
                    <p class="section-kicker">Progression</p>
                    ${getCategories().map(item => `
                        <button type="button" class="trainer-category ${item.id === state.categoryId ? 'active' : ''}" data-category="${item.id}">
                            <span>${item.title}</span>
                            <small>${item.trackTitle}</small>
                        </button>
                    `).join('')}
                    <div class="trainer-progress-card">
                        <strong>${progress.mastered}/${category.positions.length}</strong>
                        <span>positions mastered</span>
                        <small>${progress.attempts} attempts &middot; ${progress.successes} conversions</small>
                    </div>
                </aside>
                <main class="trainer-board-panel">
                    <div class="trainer-board-header">
                        <div>
                            <p class="section-meta">${category.trackTitle}</p>
                            <h3>${category.title}</h3>
                            <p>${category.summary}</p>
                        </div>
                        <select id="trainerPositionSelect" class="library-select">
                            ${category.positions.map((item, index) => `<option value="${index}" ${index === state.positionIndex ? 'selected' : ''}>${index + 1}. ${item.title}</option>`).join('')}
                        </select>
                    </div>
                    <div class="trainer-practice">
                        <div id="trainerBoard" class="trainer-board" role="grid" aria-label="Endgame training board">
                            ${renderBoard()}
                        </div>
                        <div class="trainer-task-card">
                            <p class="section-meta">Objective</p>
                            <h4>${position.goal}</h4>
                            <p>${category.objective}</p>
                            <dl>
                                <div><dt>Move limit</dt><dd>${position.maxMoves}</dd></div>
                                <div><dt>Played</dt><dd>${state.moveCount}</dd></div>
                                <div><dt>Attempts</dt><dd>${currentProgress.attempts || 0}</dd></div>
                                <div><dt>Best</dt><dd>${currentProgress.bestMoves ? `${currentProgress.bestMoves} moves` : 'Not yet'}</dd></div>
                            </dl>
                            <div class="trainer-status ${state.status === 'complete' ? 'complete' : ''}">${state.message}</div>
                            <div class="trainer-actions">
                                <button type="button" class="featured-btn primary-action" onclick="restartEndgamePosition()">Retry position</button>
                                <button type="button" class="featured-btn" onclick="nextEndgamePosition()">Next position</button>
                            </div>
                            <p class="trainer-fen">${boardToFen(state.board, state.turn)}</p>
                        </div>
                    </div>
                </main>
            </div>
        `;
        root.querySelectorAll('.trainer-square').forEach(button => {
            button.addEventListener('click', () => handleSquare(button.dataset.square));
        });
        root.querySelectorAll('.trainer-category').forEach(button => {
            button.addEventListener('click', () => {
                state.categoryId = button.dataset.category;
                loadPosition(0);
            });
        });
        document.getElementById('trainerPositionSelect')?.addEventListener('change', event => loadPosition(Number(event.target.value)));
    }

    window.showEndgameTrainer = function showEndgameTrainer(push = true) {
        document.body.classList.add('training-view');
        [
            'communityLibraryNote',
            'libraryControls',
            'featuredSection',
            'newSinceVisitBanner',
            'authorProfileSection',
            'recentlyViewedSection',
            'latestSection',
            'archiveHeader',
            'noResults',
            'resultsGrid',
            'paginationContainer'
        ].forEach(id => document.getElementById(id)?.classList.add('hidden'));
        document.getElementById('endgameTrainerSection')?.classList.remove('hidden');
        if (push) window.history.pushState({}, '', `${window.location.pathname}?view=endgames`);
        loadPosition(state.positionIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.showCommunityLibrary = function showCommunityLibrary(push = true) {
        document.body.classList.remove('training-view');
        document.getElementById('endgameTrainerSection')?.classList.add('hidden');
        ['communityLibraryNote', 'libraryControls'].forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        if (push) window.history.pushState({}, '', window.location.pathname);
        if (typeof renderArchive === 'function') renderArchive();
    };

    window.restartEndgamePosition = function restartEndgamePosition() {
        loadPosition(state.positionIndex);
    };

    window.nextEndgamePosition = function nextEndgamePosition() {
        const category = getCurrentCategory();
        loadPosition((state.positionIndex + 1) % category.positions.length);
    };

    window.initEndgameRoute = function initEndgameRoute() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'endgames') window.showEndgameTrainer(false);
    };
})();
