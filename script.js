// Dimensioni della griglia
const width = 15;
const game = document.getElementById("game");
const message = document.getElementById("message");

// Layout:
// 0 = pallino
// 1 = muro
// 2 = spazio vuoto
const layout = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
    1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,
    1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,
    1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,
    1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
    1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,
    1,2,2,1,0,0,0,2,0,0,0,1,2,2,1,
    1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,
    1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
    1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,
    1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,
    1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,
    1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];

// Celle HTML
const cells = [];

// Creazione mappa
layout.forEach(value => {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    if (value === 1) cell.classList.add("wall");
    if (value === 0) cell.classList.add("dot");

    game.appendChild(cell);
    cells.push(cell);
});

// Posizione player
let playerIndex = 22;
cells[playerIndex].classList.add("player");

// Fantasmi
const ghosts = [
    { index: 112, class: "red", direction: 1 },
    { index: 116, class: "blue", direction: -1 }
];

// Disegno fantasmi
ghosts.forEach(g => {
    cells[g.index].classList.add("ghost", g.class);
});

// Movimento player
document.addEventListener("keydown", e => {
    cells[playerIndex].classList.remove("player");

    let next = playerIndex;

    switch (e.key) {
        case "ArrowUp":
            next -= width;
            break;
        case "ArrowDown":
            next += width;
            break;
        case "ArrowLeft":
            next -= 1;
            break;
        case "ArrowRight":
            next += 1;
            break;
    }

    if (!cells[next].classList.contains("wall")) {
        playerIndex = next;
    }

    if (cells[playerIndex].classList.contains("dot")) {
        cells[playerIndex].classList.remove("dot");
    }

    cells[playerIndex].classList.add("player");
    checkWin();
});

// Movimento fantasmi
function moveGhost(ghost) {
    const directions = [-1, 1, width, -width];
    let dir = directions[Math.floor(Math.random() * directions.length)];

    let next = ghost.index + dir;

    if (
        !cells[next].classList.contains("wall") &&
        !cells[next].classList.contains("ghost")
    ) {
        cells[ghost.index].classList.remove("ghost", ghost.class);
        ghost.index = next;
        cells[ghost.index].classList.add("ghost", ghost.class);
    }

    if (ghost.index === playerIndex) {
        gameOver();
    }
}

// Loop fantasmi
ghosts.forEach(g =>
    setInterval(() => moveGhost(g), 500)
);

// Vittoria
function checkWin() {
    if (!document.querySelector(".dot")) {
        message.textContent = "HAI VINTO!";
        document.removeEventListener("keydown", () => {});
    }
}

// Sconfitta
function gameOver() {
    message.textContent = "GAME OVER";
    document.removeEventListener("keydown", () => {});
}