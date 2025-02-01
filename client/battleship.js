document.addEventListener("DOMContentLoaded", () => {
  const GAME_MODE = Object.freeze({
    PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
    PLAYER_VS_AI: Symbol("playerVsAI"),
  });

  class Position {
    #x;
    #y;

    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    get asString() {
      return `${this.#x}${this.#y}`;
    }
  }

  class Ship {
    #name;
    #length;
    #positions = [];

    constructor(name, length) {
      this.name = name;
      this.length = length;
    }

    get name() {
      return this.#name;
    }

    get length() {
      return this.#length;
    }

    get positions() {
      return this.#positions;
    }

    addPosition(position) {
      this.#positions.add(position);
    }
  }

  class Fleet {
    #ships = [];

    constructor() {
      this.ships = [
        new Ship("carrier", 5),
        new Ship("battleship", 4),
        new Ship("cruiser", 3),
        new Ship("submarine", 3),
        new Ship("destroyer", 2),
      ];
    }

    get nextToLocate() {
      return this.#ships.find((ship) => ship.po);
    }
  }

  const playerBoardGrid = document.querySelector(".board--player .squares");
  const enemyBoardGrid = document.querySelector(".board--enemy .squares");

  const playerVsPlayerOptionBtn = document.querySelector(
    "#player_vs_player_button"
  );
  const playerVsAIOptionBtn = document.querySelector("#player_vs_ai_button");

  let gameMode;

  toggleOnOffElement(playerBoardGrid);
  toggleOnOffElement(enemyBoardGrid);

  function startGameMode(chosenGameMode) {
    gameMode = chosenGameMode;
    toggleOnOffElement(playerVsPlayerOptionBtn);
    toggleOnOffElement(playerVsAIOptionBtn);
    playerBoardGrid.style.display = "grid";
    generateBoard(playerBoardGrid, "player");
    generateBoard(enemyBoardGrid, "enemy");
  }

  function generateBoard(board, squareType) {
    let letterCounter = "a";
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const square = document.createElement("div");
        square.classList.add(...["square", `square--${squareType}`]);
        if (row !== 0 && column !== 0) {
          square.dataset.position = `${row}${column}`;
        }
        if (row === 0 && column !== 0) {
          square.textContent = column;
        }
        if (column === 0 && row !== 0) {
          square.textContent = String.fromCharCode(
            letterCounter.charCodeAt(letterCounter.length - 1) + row - 1
          );
        }
        board.appendChild(square);
      }
    }
  }

  function toggleOnOffElement(element) {
    const { style } = element;
    style.display = style.display === "none" ? "block" : "none";
  }

  playerVsPlayerOptionBtn.addEventListener("click", () =>
    startGameMode(GAME_MODE.PLAYER_VS_PLAYER)
  );
  playerVsAIOptionBtn.addEventListener("click", () =>
    startGameMode(GAME_MODE.PLAYER_VS_AI)
  );
});
