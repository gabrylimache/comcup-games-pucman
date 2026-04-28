const gridElement = document.getElementById('grid');

const scoreElement = document.getElementById('score');

const startBtn = document.getElementById('start-btn');

const overlay = document.getElementById('overlay');

const statusText = document.getElementById('status-text');
 
const width = 15;

let cells = [];

let score = 0;

let playerIndex = 16; // Posizione iniziale

let dotsCount = 0;

let isGameOver = true;
 
// Mappa: 0 = Punto, 1 = Muro, 2 = Spazio vuoto

const layout = [

    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,

    1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,

    1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,

    1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,

    1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,

    1,0,0,0,0,1,0,1,0,1,0,0,0,0,1,

    1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,

    2,2,2,1,0,0,0,2,0,0,0,1,2,2,2,

    1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,

    1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,

    1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,

    1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,

    1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,

    1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,

    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1

];
 
// Fantasmi

class Ghost {

    constructor(className, startIndex, speed) {

        this.className = className;

        this.startIndex = startIndex;

        this.currentIndex = startIndex;

        this.speed = speed;

        this.timerId = NaN;

    }

}
 
const ghosts = [

    new Ghost('ghost-red', 104, 300),

    new Ghost('ghost-blue', 115, 400)

];
 
// Creazione Griglia

function createBoard() {

    gridElement.innerHTML = '';

    cells = [];

    dotsCount = 0;

    layout.forEach((value, index) => {

        const cell = document.createElement('div');

        cell.classList.add('cell');

        gridElement.appendChild(cell);

        cells.push(cell);
 
        if (value === 1) cell.classList.add('wall');

        else if (value === 0) {

            cell.classList.add('dot');

            dotsCount++;

        }

    });

}
 
// Movimento Giocatore

function handleKeyPress(e) {

    if (isGameOver) return;

    cells[playerIndex].classList.remove('player');

    let nextIndex = playerIndex;
 
    switch(e.key) {

        case 'ArrowLeft': if (playerIndex % width !== 0) nextIndex -= 1; break;

        case 'ArrowRight': if (playerIndex % width < width - 1) nextIndex += 1; break;

        case 'ArrowUp': if (playerIndex - width >= 0) nextIndex -= width; break;

        case 'ArrowDown': if (playerIndex + width < width * width) nextIndex += width; break;

    }
 
    if (!cells[nextIndex].classList.contains('wall')) {

        playerIndex = nextIndex;

    }
 
    // Mangia pallino

    if (cells[playerIndex].classList.contains('dot')) {

        cells[playerIndex].classList.remove('dot');

        score += 10;

        dotsCount--;

        scoreElement.textContent = `Punti: ${score}`;

        checkWin();

    }
 
    cells[playerIndex].classList.add('player');

    checkGameOver();

}
 
// Logica Fantasmi

function moveGhost(ghost) {

    const directions = [-1, 1, width, -width];

    let direction = directions[Math.floor(Math.random() * directions.length)];
 
    ghost.timerId = setInterval(() => {

        // Se non colpisce un muro o un altro fantasma

        if (!cells[ghost.currentIndex + direction].classList.contains('wall') && 

            !cells[ghost.currentIndex + direction].classList.contains('ghost')) {

            cells[ghost.currentIndex].classList.remove(ghost.className, 'ghost');

            ghost.currentIndex += direction;

            cells[ghost.currentIndex].classList.add(ghost.className, 'ghost');

        } else {

            direction = directions[Math.floor(Math.random() * directions.length)];

        }

        checkGameOver();

    }, ghost.speed);

}
 
function checkGameOver() {

    if (cells[playerIndex].classList.contains('ghost')) {

        ghosts.forEach(g => clearInterval(g.timerId));

        isGameOver = true;

        statusText.textContent = "GAME OVER!";

        overlay.classList.add('visible');

    }

}
 
function checkWin() {

    if (dotsCount === 0) {

        ghosts.forEach(g => clearInterval(g.timerId));

        isGameOver = true;

        statusText.textContent = "HAI VINTO!";

        overlay.classList.add('visible');

    }

}
 
function startGame() {

    if (!isGameOver) return;

    // Reset variabili

    score = 0;

    scoreElement.textContent = `Punti: 0`;

    isGameOver = false;

    playerIndex = 16;

    overlay.classList.remove('visible');
 
    createBoard();

    cells[playerIndex].classList.add('player');
 
    ghosts.forEach(ghost => {

        ghost.currentIndex = ghost.startIndex;

        moveGhost(ghost);

    });

}
 
document.addEventListener('keydown', handleKeyPress);

startBtn.addEventListener('click', startGame);
 
// Inizializzazione visiva

createBoard();
 