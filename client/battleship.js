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
          if (
            fleetPositions.some(
              (pos) => pos.x === position.x && pos.y === position.y
            )
          ) {
            canPlace = false;
          } else {
            positions.push(position);
          }
        }
      } else {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const position = new Position(x, y + i);
          if (
            fleetPositions.some(
              (pos) => pos.x === position.x && pos.y === position.y
            )
          ) {
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
      const squares = [];
      this.#prepareGrid(grid, squareType);
      console.log(grid);
      this.#showGrid(board, grid);
      const game = this.#game;
      const boardRef = this;
      grid.forEach((row) => {
        row.forEach((square) => {
          square.addEventListener("click", () => {
            const position = Position.fromString(square.dataset.position);
            const canPlace = game.tryToPlaceShip(position);
          });

          square.addEventListener("mouseover", () => {
            const squaresToSelect = boardRef.#selectSqaures(
              square,
              grid,
              game,
              false
            );
            const cssClass =
              squaresToSelect.length === game.numberOfSquaresToPlaceNextShip
                ? `square--valid`
                : `square--invalid`;
            squaresToSelect.forEach((el) => el.classList.add(cssClass));
          });

          square.addEventListener("mouseleave", () => {
            const squaresToUnselect = boardRef.#selectSqaures(
              square,
              grid,
              game,
              false
            );
            const numberOfSquaresToPlaceNextShip =
              game.numberOfSquaresToPlaceNextShip;
            for (let i = 0; i <= numberOfSquaresToPlaceNextShip; i++) {
              const el = squaresToUnselect[i];
              if (el) {
                el.classList.remove(...[`square--valid`, `square--invalid`]);
              }
            }
          });
        });
      });
    };

    #prepareGrid(grid, squareType) {
      let letterCounter = "A";
      for (let row = 0; row < 8; row++) {
        let rowOfSquares = [];
        for (let column = 0; column < 8; column++) {
          const square = document.createElement("div");
          square.classList.add(...["square", `square--${squareType}`]);
          const isInNotInFirstRowAndColumn = row !== 0 && column !== 0;
          if (isInNotInFirstRowAndColumn) {
            const position = new Position(column, row);
            square.dataset.position = position.asString;
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
          rowOfSquares[column] = square;
        }
        grid.push(rowOfSquares);
      }
    }

    #showGrid(board, grid) {
      let counter = 0;
      const squares = grid.flat(1);
      let interval = setInterval(() => {
        board.appendChild(squares[counter++]);
        if (counter >= squares.length) {
          clearInterval(interval);
        }
      }, 25);
    }

    #selectSqaures(square, grid, game, shouldIgnoreTakenSquares) {
      const numberOfSquaresToPlaceNextShip =
        game.numberOfSquaresToPlaceNextShip;
      const rowOfSquares = grid.find((row) => row.includes(square));
      const squareColumnIndex = rowOfSquares.indexOf(square);
      const squareRowIndex = grid.indexOf(rowOfSquares);
      const squaresToSelect = [];
      if (squareColumnIndex === 0 || squareRowIndex === 0) {
        return [];
      }
      if (game.shipDirection === "horizontally") {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const el = rowOfSquares[squareColumnIndex + i];
          if (
            squareColumnIndex + i < 8 &&
            (!el.classList.contains(`square--taken`) ||
              shouldIgnoreTakenSquares)
          ) {
            squaresToSelect.push(el);
          }
        }
      } else {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const row = grid[squareRowIndex + i];
          if (row === undefined) {
            return squaresToSelect;
          }
          const el = row[squareColumnIndex];
          if (
            squareRowIndex + i < 8 &&
            (!el.classList.contains(`square--taken`) ||
              shouldIgnoreTakenSquares)
          ) {
            squaresToSelect.push(el);
          }
        }
      }
      return squaresToSelect;
    }

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
