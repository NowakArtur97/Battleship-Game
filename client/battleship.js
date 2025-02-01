document.addEventListener("DOMContentLoaded", () => {
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

  class Board {
    static GAME_MODE = Object.freeze({
      PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
      PLAYER_VS_AI: Symbol("playerVsAI"),
    });

    #gameMode;
    #playerBoardGrid;
    #enemyBoardGrid;
    #playerVsPlayerOptionBtn;
    #playerVsAIOptionBtn;
    #horizontalShipPlacementBtn;
    #verticalShipPlacementBtn;

    constructor() {
      this.#playerBoardGrid = document.querySelector(".board--player .squares");
      this.#enemyBoardGrid = document.querySelector(".board--enemy .squares");
      this.#playerVsPlayerOptionBtn = document.querySelector(
        "#player_vs_player_button"
      );
      this.#playerVsAIOptionBtn = document.querySelector(
        "#player_vs_ai_button"
      );
      this.#enemyBoardGrid = document.querySelector(".board--enemy .squares");
      this.#playerVsPlayerOptionBtn.addEventListener("click", () =>
        this.#startGameMode(Board.GAME_MODE.PLAYER_VS_PLAYER)
      );
      this.#playerVsAIOptionBtn.addEventListener("click", () =>
        this.#startGameMode(Board.GAME_MODE.PLAYER_VS_AI)
      );
      this.#horizontalShipPlacementBtn = document.querySelector(
        "#horizontal_ship_placement_button"
      );
      this.#verticalShipPlacementBtn = document.querySelector(
        "#vertital_ship_placement_button"
      );
      this.#prepareBoardForGame();
    }

    #prepareBoardForGame() {
      this.#toggleOnOffElement(this.#playerBoardGrid);
      this.#toggleOnOffElement(this.#enemyBoardGrid);
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
    }

    #startGameMode(chosenGameMode) {
      this.#gameMode = chosenGameMode;
      this.#generateBoards();
    }

    #generateBoards() {
      this.#toggleOnOffElement(this.#playerVsPlayerOptionBtn);
      this.#toggleOnOffElement(this.#playerVsAIOptionBtn);
      this.#playerBoardGrid.style.display = "grid";
      this.#generateBoard(this.#playerBoardGrid, "player");
      this.#generateBoard(this.#enemyBoardGrid, "enemy");
      this.#startPlacingShips();
    }

    #startPlacingShips() {
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
    }

    #generateBoard = function (board, squareType) {
      let letterCounter = "a";
      for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
          const square = document.createElement("div");
          square.classList.add(...["square", `square--${squareType}`]);
          if (row !== 0 && column !== 0) {
            square.dataset.position = `${row}${column}`;
            // square.addEventListener("click", positionShip);
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
    };

    #toggleOnOffElement(element) {
      const { style } = element;
      style.display = style.display === "none" ? "block" : "none";
    }
  }

  const board = new Board();
});
