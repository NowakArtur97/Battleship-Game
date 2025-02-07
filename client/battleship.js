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
      this.#name = name;
      this.#length = length;
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

    get areAllShipsPlacedOnBoard() {
      return this.#ships.every((ship) => ship.positions().length !== 0);
    }
  }

  class Player {
    #fleet;

    constructor() {
      this.#fleet = new Fleet();
    }

    get fleet() {
      return this.#fleet;
    }
  }

  class Game {
    static GAME_MODE = Object.freeze({
      PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
      PLAYER_VS_AI: Symbol("playerVsAI"),
    });
    #board;
    #gameMode;
    #shipPlacementDirection = "vertically";
    #player;
    #enemy;

    constructor(board) {
      this.#board = board;
      this.#player = new Player();
      this.#enemy = new Player();
      this.#board.prepareBoardForGame();
    }

    set gameMode(gameMode) {
      this.#gameMode = gameMode;
      this.#board.generateBoards();
      this.#placeShipsOnBoard();
    }

    get shipDirection() {
      return this.#shipPlacementDirection;
    }

    set shipDirection(direction) {
      this.#shipPlacementDirection = direction;
      console.log(direction);
    }

    get numberOfSquares() {
      return 5;
    }

    tryToPlaceShip(position) {
      console.log(position);
    }

    #placeShipsOnBoard() {
      // while (this.#player.fleet.areAllShipsPlacedOnBoard) {}
    }
  }

  class Board {
    #game;
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
        this.#startGameMode(Game.GAME_MODE.PLAYER_VS_PLAYER)
      );
      this.#playerVsAIOptionBtn.addEventListener("click", () =>
        this.#startGameMode(Game.GAME_MODE.PLAYER_VS_AI)
      );
      this.#horizontalShipPlacementBtn = document.querySelector(
        "#horizontal_ship_placement_button"
      );
      this.#verticalShipPlacementBtn = document.querySelector(
        "#vertital_ship_placement_button"
      );
    }

    prepareBoardForGame() {
      this.#toggleOnOffElement(this.#playerBoardGrid);
      this.#toggleOnOffElement(this.#enemyBoardGrid);
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
    }

    #startGameMode(chosenGameMode) {
      this.#game.gameMode = chosenGameMode;
    }

    generateBoards() {
      this.#toggleOnOffElement(this.#playerVsPlayerOptionBtn);
      this.#toggleOnOffElement(this.#playerVsAIOptionBtn);
      this.#playerBoardGrid.style.display = "grid";
      this.#generateBoard(this.#playerBoardGrid, "player");
      // TODO: Generate later
      // this.#generateBoard(this.#enemyBoardGrid, "enemy");
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#horizontalShipPlacementBtn.addEventListener("click", () =>
        this.setShipDirection("horizontally")
      );
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
      this.#verticalShipPlacementBtn.addEventListener("click", () =>
        this.setShipDirection("vertically")
      );
    }

    setShipDirection(direction) {
      this.#game.shipDirection = direction;
    }

    #generateBoard = function (board, squareType) {
      let letterCounter = "A";
      const squares = [];
      for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
          const square = document.createElement("div");
          square.classList.add(...["square", `square--${squareType}`]);
          if (row !== 0 && column !== 0) {
            const position = new Position(column, row);
            square.dataset.position = position.asString;
          }
          if (row === 0 && column !== 0) {
            square.textContent = column;
          }
          if (column === 0 && row !== 0) {
            square.textContent = String.fromCharCode(
              letterCounter.charCodeAt(letterCounter.length - 1) + row - 1
            );
          }
          squares.push(square);
        }
      }
      let counter = 0;
      let interval = setInterval(() => {
        board.appendChild(squares[counter++]);
        if (counter >= squares.length) {
          clearInterval(interval);
        }
      }, 25);
      const game = this.#game;
      squares
        .filter((square) => square.textContent === "")
        .forEach((square) => {
          square.addEventListener("click", () => {
            game.tryToPlaceShip(position);
          });

          square.addEventListener("mouseover", () => {
            const numberOfSquares = game.numberOfSquares;
            const shipDirection = game.shipDirection;
            let el = square;
            if (shipDirection === "horizontally") {
              for (let i = 0; i < numberOfSquares; i++) {
                if (el) {
                  el.classList.add(`square--hover`);
                }
                el = el.nextSibling;
                if (el.textContent !== "") {
                  return;
                }
              }
            } else {
              const indexOfSquare = squares.indexOf(square);
              for (let i = 0; i < numberOfSquares; i++) {
                if (el) {
                  el.classList.add(`square--hover`);
                }
                el = squares[indexOfSquare + 8 * (i + 1)];
              }
            }
          });

          square.addEventListener("mouseleave", () => {
            const numberOfSquares = game.numberOfSquares;
            const shipDirection = game.shipDirection;
            let el = square;
            if (shipDirection === "horizontally") {
              for (let i = 0; i < numberOfSquares; i++) {
                if (el) {
                  el.classList.remove(`square--hover`);
                }
                el = el.nextSibling;
                if (el.textContent !== "") {
                  return;
                }
              }
            } else {
              const indexOfSquare = squares.indexOf(square);
              for (let i = 0; i < numberOfSquares; i++) {
                if (el) {
                  el.classList.remove(`square--hover`);
                }
                el = squares[indexOfSquare + 8 * (i + 1)];
              }
            }
          });
        });
    };

    #toggleOnOffElement(element) {
      const { style } = element;
      style.display = style.display === "none" ? "block" : "none";
    }

    set game(game) {
      this.#game = game;
    }
  }

  const board = new Board();
  const game = new Game(board);
  board.game = game;
});
