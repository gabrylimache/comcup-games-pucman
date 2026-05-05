
const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('status-text');

const width = 21;
const height = 21;
const totalCells = width * height;

const PLAYER_START_INDEX = 325;

const GAME_SPEED = 130;
const POWER_TIME = 7000;

let cells = [];
let score = 0;
let lives = 3;
let dotsCount = 0;
let playerIndex = PLAYER_START_INDEX;

let currentDirection = 0;
let requestedDirection = 0;

let isGameOver = true;
let gameTimerId = null;
let powerTimerId = null;
let isPowerMode = false;

/*
Legenda mappa:
# = muro
. = pallino
o = power-up
spazio = percorso vuoto
- = porta della casa dei fantasmi
*/
const layout = [
    "#####################",
    "#o.......#.........o#",
    "#.###.###.#.###.###.#",
    "#...................#",
    "#.###.#.#####.#.###.#",
    "#.....#...#...#.....#",
    "#####.### # ###.#####",
    "    #.#       #.#    ",
    "#####.# ##-## #.#####",
    "     .  #   #  .     ",
    "#####.# ##### #.#####",
    "    #.#       #.#    ",
    "#####.# ##### #.#####",
    "#.........#.........#",
    "#.###.###.#.###.###.#",
    "#o..#...........#..o#",
    "###.#.#.#####.#.#.###",
    "#.....#...#...#.....#",
    "#.#######.#.#######.#",
    "#...................#",
    "#####################"
];

class Ghost {
    constructor(className, startIndex, moveDelay, releaseDelay) {
        this.className = className;
        this.startIndex = startIndex;
        this.currentIndex = startIndex;
        this.moveDelay = moveDelay;
        this.releaseDelay = releaseDelay;
        this.lastMoveTime = 0;
        this.direction = -width;
        this.isReleased = false;
        this.releaseTime = 0;
    }

    reset() {
        this.currentIndex = this.startIndex;
        this.lastMoveTime = 0;
        this.direction = -width;
        this.isReleased = false;
        this.releaseTime = Date.now() + this.releaseDelay;
    }
}

const ghosts = [
    new Ghost('ghost-red', 199, 260, 800),
    new Ghost('ghost-blue', 198, 310, 2500),
    new Ghost('ghost-pink', 200, 330, 4000),
    new Ghost('ghost-orange', 220, 360, 5500)
];

function createBoard() {
    gridElement.innerHTML = '';
    cells = [];
    dotsCount = 0;

    layout.forEach(row => {
        row.split('').forEach(symbol => {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (symbol === '#') {
                cell.classList.add('wall');
            }

            if (symbol === '.') {
                cell.classList.add('dot');
                dotsCount++;
            }

            if (symbol === 'o') {
                cell.classList.add('power-pellet');
                dotsCount++;
            }

            if (symbol === '-') {
                cell.classList.add('ghost-door');
            }

            gridElement.appendChild(cell);
            cells.push(cell);
        });
    });
}

function getRow(index) {
    return Math.floor(index / width);
}

function getCol(index) {
    return index % width;
}

function getNextIndex(index, direction) {
    const row = getRow(index);
    const col = getCol(index);

    if (direction === -1 && col === 0) {
        return row * width + (width - 1);
    }

    if (direction === 1 && col === width - 1) {
        return row * width;
    }

    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= totalCells) {
        return index;
    }

    return nextIndex;
}

function canPlayerMoveTo(index) {
    if (!cells[index]) return false;
    if (cells[index].classList.contains('wall')) return false;
    if (cells[index].classList.contains('ghost-door')) return false;
    return true;
}

function canGhostMoveTo(index) {
    if (!cells[index]) return false;
    if (cells[index].classList.contains('wall')) return false;
    if (cells[index].classList.contains('ghost')) return false;
    return true;
}

function handleKeyDown(e) {
    if (isGameOver) return;

    let newDirection = 0;

    switch (e.key) {
        case 'ArrowLeft':
            newDirection = -1;
            break;
        case 'ArrowRight':
            newDirection = 1;
            break;
        case 'ArrowUp':
            newDirection = -width;
            break;
        case 'ArrowDown':
            newDirection = width;
            break;
        default:
            return;
    }

    e.preventDefault();
    requestedDirection = newDirection;
}

function movePlayer() {
    if (requestedDirection !== 0) {
        const requestedIndex = getNextIndex(playerIndex, requestedDirection);

        if (canPlayerMoveTo(requestedIndex)) {
            currentDirection = requestedDirection;
        }
    }

    if (currentDirection === 0) return;

    const nextIndex = getNextIndex(playerIndex, currentDirection);

    if (!canPlayerMoveTo(nextIndex)) {
        return;
    }

    cells[playerIndex].classList.remove(
        'player',
        'player-left',
        'player-right',
        'player-up',
        'player-down'
    );

    playerIndex = nextIndex;

    eatDotOrPowerPellet();
    addPlayerToBoard();
    checkGhostCollision();
}

function addPlayerToBoard() {
    cells[playerIndex].classList.add('player');

    if (currentDirection === -1) {
        cells[playerIndex].classList.add('player-left');
    } else if (currentDirection === 1) {
        cells[playerIndex].classList.add('player-right');
    } else if (currentDirection === -width) {
        cells[playerIndex].classList.add('player-up');
    } else if (currentDirection === width) {
        cells[playerIndex].classList.add('player-down');
    }
}

function eatDotOrPowerPellet() {
    if (cells[playerIndex].classList.contains('dot')) {
        cells[playerIndex].classList.remove('dot');
        score += 10;
        dotsCount--;
        updateHud();
        checkWin();
    }

    if (cells[playerIndex].classList.contains('power-pellet')) {
        cells[playerIndex].classList.remove('power-pellet');
        score += 50;
        dotsCount--;
        updateHud();
        activatePowerMode();
        checkWin();
    }
}

function activatePowerMode() {
    isPowerMode = true;

    ghosts.forEach(ghost => {
        cells[ghost.currentIndex].classList.add('frightened');
    });

    clearTimeout(powerTimerId);

    powerTimerId = setTimeout(() => {
        isPowerMode = false;

        ghosts.forEach(ghost => {
            if (cells[ghost.currentIndex]) {
                cells[ghost.currentIndex].classList.remove('frightened');
            }
        });
    }, POWER_TIME);
}

function moveGhosts() {
    const now = Date.now();

    ghosts.forEach(ghost => {
        if (!ghost.isReleased) {
            if (now >= ghost.releaseTime) {
                ghost.isReleased = true;
            } else {
                return;
            }
        }

        if (now - ghost.lastMoveTime < ghost.moveDelay) {
            return;
        }

        ghost.lastMoveTime = now;

        const possibleDirections = getPossibleGhostDirections(ghost);

        if (possibleDirections.length === 0) {
            return;
        }

        ghost.direction = chooseGhostDirection(ghost, possibleDirections);

        cells[ghost.currentIndex].classList.remove(
            ghost.className,
            'ghost',
            'frightened'
        );

        ghost.currentIndex = getNextIndex(ghost.currentIndex, ghost.direction);

        cells[ghost.currentIndex].classList.add(ghost.className, 'ghost');

        if (isPowerMode) {
            cells[ghost.currentIndex].classList.add('frightened');
        }

        checkGhostCollision();
    });
}

function getPossibleGhostDirections(ghost) {
    const directions = [-1, 1, -width, width];

    return directions.filter(direction => {
        const nextIndex = getNextIndex(ghost.currentIndex, direction);

        if (!canGhostMoveTo(nextIndex)) {
            return false;
        }

        const oppositeDirection = ghost.direction * -1;

        if (direction === oppositeDirection) {
            const otherDirections = directions.filter(otherDirection => {
                const otherIndex = getNextIndex(ghost.currentIndex, otherDirection);
                return canGhostMoveTo(otherIndex) && otherDirection !== oppositeDirection;
            });

            return otherDirections.length === 0;
        }

        return true;
    });
}

function chooseGhostDirection(ghost, possibleDirections) {
    if (isPowerMode) {
        return chooseDirectionAwayFromPlayer(ghost, possibleDirections);
    }

    const randomChance = Math.random();

    if (randomChance < 0.65) {
        return chooseDirectionTowardPlayer(ghost, possibleDirections);
    }

    return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
}

function chooseDirectionTowardPlayer(ghost, possibleDirections) {
    let bestDirection = possibleDirections[0];
    let shortestDistance = Infinity;

    possibleDirections.forEach(direction => {
        const nextIndex = getNextIndex(ghost.currentIndex, direction);
        const distance = getDistance(nextIndex, playerIndex);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            bestDirection = direction;
        }
    });

    return bestDirection;
}

function chooseDirectionAwayFromPlayer(ghost, possibleDirections) {
    let bestDirection = possibleDirections[0];
    let longestDistance = -Infinity;

    possibleDirections.forEach(direction => {
        const nextIndex = getNextIndex(ghost.currentIndex, direction);
        const distance = getDistance(nextIndex, playerIndex);

        if (distance > longestDistance) {
            longestDistance = distance;
            bestDirection = direction;
        }
    });

    return bestDirection;
}

function getDistance(indexA, indexB) {
    const rowA = getRow(indexA);
    const colA = getCol(indexA);
    const rowB = getRow(indexB);
    const colB = getCol(indexB);

    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
}

function checkGhostCollision() {
    const touchedGhost = ghosts.find(ghost => ghost.currentIndex === playerIndex);

    if (!touchedGhost) return;

    if (isPowerMode) {
        eatGhost(touchedGhost);
    } else {
        loseLife();
    }
}

function eatGhost(ghost) {
    cells[ghost.currentIndex].classList.remove(
        ghost.className,
        'ghost',
        'frightened'
    );

    score += 200;
    updateHud();

    ghost.reset();
    cells[ghost.currentIndex].classList.add(ghost.className, 'ghost');

    if (isPowerMode) {
        cells[ghost.currentIndex].classList.add('frightened');
    }
}

function loseLife() {
    lives--;
    updateHud();

    if (lives <= 0) {
        endGame('GAME OVER!');
        return;
    }

    resetPositions();
}

function resetPositions() {
    cells[playerIndex].classList.remove(
        'player',
        'player-left',
        'player-right',
        'player-up',
        'player-down'
    );

    ghosts.forEach(ghost => {
        cells[ghost.currentIndex].classList.remove(
            ghost.className,
            'ghost',
            'frightened'
        );
    });

    playerIndex = PLAYER_START_INDEX;
    currentDirection = 0;
    requestedDirection = 0;

    ghosts.forEach(ghost => {
        ghost.reset();
        cells[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    });

    addPlayerToBoard();
}

function updateHud() {
    scoreElement.textContent = `Punti: ${score}`;
    livesElement.textContent = `Vite: ${lives}`;
}

function checkWin() {
    if (dotsCount === 0) {
        endGame('HAI VINTO!');
    }
}

function endGame(message) {
    isGameOver = true;

    clearInterval(gameTimerId);
    clearTimeout(powerTimerId);

    gameTimerId = null;
    powerTimerId = null;

    statusText.textContent = message;
    startBtn.textContent = 'Rigioca';
    overlay.classList.add('visible');
}

function gameLoop() {
    if (isGameOver) return;

    movePlayer();
    moveGhosts();
}

function startGame() {
    clearInterval(gameTimerId);
    clearTimeout(powerTimerId);

    score = 0;
    lives = 3;
    playerIndex = PLAYER_START_INDEX;
    currentDirection = 0;
    requestedDirection = 0;
    isGameOver = false;
    isPowerMode = false;

    updateHud();
    createBoard();

    addPlayerToBoard();

    ghosts.forEach(ghost => {
        ghost.reset();
        cells[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    });

    overlay.classList.remove('visible');

    gameTimerId = setInterval(gameLoop, GAME_SPEED);
}

document.addEventListener('keydown', handleKeyDown);
startBtn.addEventListener('click', startGame);

createBoard();
updateHud();
