document.addEventListener("DOMContentLoaded", () => {
  class Position {
    #x;
    #y;

    constructor(x, y) {
      this.#x = x;
      this.#y = y;
    }

    get x() {
      return this.#x;
    }

    get y() {
      return this.#y;
    }

    get asString() {
      return `${this.#x}${this.#y}`;
    }

    static fromString(positionAsString) {
      const x = +positionAsString.slice(0, positionAsString.length / 2);
      const y = +positionAsString.slice(
        positionAsString.length / 2,
        positionAsString.length
      );
      return new Position(x, y);
    }
  }

  class Ship {
    #name;
    #length;
    #positions;

    constructor(name, length) {
      this.#name = name;
      this.#length = length;
      this.#positions = [];
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

    set positions(positions) {
      this.#positions = positions;
    }
  }

  class Fleet {
    #ships = [];

    constructor() {
      this.#ships = [
        new Ship("carrier", 5),
        new Ship("battleship", 4),
        new Ship("cruiser", 3),
        new Ship("submarine", 3),
        new Ship("destroyer", 2),
      ];
    }

    get nextToLocate() {
      return this.#ships.find((ship) => ship.positions.length === 0);
    }

    get areAllShipsPlacedOnBoard() {
      return this.#ships.every((ship) => ship.positions.length !== 0);
    }

    get fleetPositions() {
      return this.#ships.map((ship) => ship.positions).flat(1);
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
    #shipPlacementDirection = "horizontally";
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

    get numberOfSquaresToPlaceNextShip() {
      const nextToLocate = this.#player.fleet.nextToLocate;
      return nextToLocate !== undefined ? nextToLocate.length : 0;
    }

    tryToPlaceShip(startingPosition) {
      const numberOfSquaresToPlaceNextShip = this
        .numberOfSquaresToPlaceNextShip;
      const { x, y } = startingPosition;
      let canPlace =
        this.#shipPlacementDirection == "horizontally"
          ? x + numberOfSquaresToPlaceNextShip <= 8
          : y + numberOfSquaresToPlaceNextShip <= 8;
      if (!canPlace) {
        return false;
      }
      const positions = [];
      const fleetPositions = this.#player.fleet.fleetPositions;
      if (this.#shipPlacementDirection == "horizontally") {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const position = new Position(x + i, y);
          if (fleetPositions.some((pos) => pos === position)) {
            canPlace = false;
          } else {
            positions.push(position);
          }
        }
      } else {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const position = new Position(x, y + i);
          if (fleetPositions.some((pos) => pos === position)) {
            canPlace = false;
          } else {
            positions.push(position);
          }
        }
      }
      if (canPlace) {
        this.#player.fleet.nextToLocate.positions = positions;
      }
      console.log(this.#player.fleet.fleetPositions);
      console.log(canPlace);
      return canPlace;
    }

    #populatePositions(x, y) {}

    #placeShipsOnBoard() {
      // while (this.#player.fleet.areAllShipsPlacedOnBoard) {}
    }
  }

  class Board {
    #game;
    #playerBoard;
    #playerBoardGrid;
    #enemyBoard;
    #enemyBoardGrid;
    #playerVsPlayerOptionBtn;
    #playerVsAIOptionBtn;
    #horizontalShipPlacementBtn;
    #verticalShipPlacementBtn;

    constructor() {
      this.#playerBoard = document.querySelector(".board--player .squares");
      this.#enemyBoard = document.querySelector(".board--enemy .squares");
      this.#playerVsPlayerOptionBtn = document.querySelector(
        "#player_vs_player_button"
      );
      this.#playerVsAIOptionBtn = document.querySelector(
        "#player_vs_ai_button"
      );
      this.#enemyBoard = document.querySelector(".board--enemy .squares");
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
      this.#playerBoardGrid = [];
      this.#enemyBoardGrid = [];
    }

    prepareBoardForGame() {
      this.#toggleOnOffElement(this.#playerBoard);
      this.#toggleOnOffElement(this.#enemyBoard);
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
    }

    #startGameMode(chosenGameMode) {
      this.#game.gameMode = chosenGameMode;
    }

    generateBoards() {
      this.#toggleOnOffElement(this.#playerVsPlayerOptionBtn);
      this.#toggleOnOffElement(this.#playerVsAIOptionBtn);
      this.#playerBoard.style.display = "grid";
      this.#generateBoard(this.#playerBoard, this.#playerBoardGrid, "player");
      // TODO: Generate later
      // this.#generateBoard(this.#enemyBoard, this.#enemyBoardGrid, "enemy");
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

    #generateBoard = function (board, grid, squareType) {
      let letterCounter = "A";
      const squares = []; // TODO: REPLACE WITH GRID VAR?
      for (let row = 0; row < 8; row++) {
        let temp = [];
        for (let column = 0; column < 8; column++) {
          const square = document.createElement("div");
          square.classList.add(...["square", `square--${squareType}`]);
          if (row !== 0 && column !== 0) {
            const position = new Position(column, row);
            square.dataset.position = position.asString;
            temp[column] = square;
          }
          const isInFirstRow = row === 0 && column !== 0;
          if (isInFirstRow) {
            square.textContent = column;
          }
          const isInFirstColumn = column === 0 && row !== 0;
          if (isInFirstColumn) {
            square.textContent = String.fromCharCode(
              letterCounter.charCodeAt(letterCounter.length - 1) + row - 1
            );
          }
          squares.push(square);
        }
        if (row !== 0) {
          grid.push(temp);
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
            const position = Position.fromString(square.dataset.position);
            game.tryToPlaceShip(position);
          });

          square.addEventListener("mouseover", () => {
            const numberOfSquaresToPlaceNextShip =
              game.numberOfSquaresToPlaceNextShip;
            const shipDirection = game.shipDirection;
            let el = square;
            const squaresToSelect = [];
            if (shipDirection === "horizontally") {
              for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
                if (el && el.textContent === "") {
                  squaresToSelect.push(el);
                }
                if (el.textContent !== "") {
                  i = numberOfSquaresToPlaceNextShip;
                }
                el = el.nextSibling;
              }
            } else {
              const indexOfSquare = squares.indexOf(square);
              for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
                if (el && el.textContent === "") {
                  squaresToSelect.push(el);
                }
                el = squares[indexOfSquare + 8 * (i + 1)];
              }
            }
            const cssClass =
              squaresToSelect.length === numberOfSquaresToPlaceNextShip
                ? `square--valid`
                : `square--invalid`;
            squaresToSelect.forEach((el) => el.classList.add(cssClass));
          });

          square.addEventListener("mouseleave", () => {
            const numberOfSquaresToPlaceNextShip =
              game.numberOfSquaresToPlaceNextShip;
            const shipDirection = game.shipDirection;
            let el = square;
            if (shipDirection === "horizontally") {
              for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
                if (el) {
                  el.classList.remove(...[`square--valid`, `square--invalid`]);
                }
                el = el.nextSibling;
              }
            } else {
              const indexOfSquare = squares.indexOf(square);
              for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
                if (el) {
                  el.classList.remove(...[`square--valid`, `square--invalid`]);
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
