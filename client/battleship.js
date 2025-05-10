document.addEventListener("DOMContentLoaded", () => {
  function generateRandomString() {
    return (Math.random() + 1).toString(36).substring(7);
  }

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
    #hitPositions;

    constructor(name, length) {
      this.#name = name;
      this.#length = length;
      this.#positions = [];
      this.#hitPositions = [];
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

    get hitPositions() {
      return this.#hitPositions;
    }

    set hitPosition(position) {
      this.#hitPositions.push(position);
    }

    isHit(position) {
      return this.#positions.some(
        (pos) => pos.x === position.x && pos.y === position.y
      );
    }

    isSunk() {
      return this.#positions.length === this.#hitPositions.length;
    }
  }

  class Fleet {
    #ships = [];

    constructor() {
      this.#ships = [
        // new Ship("carrier", 5), new Ship("battleship", 4),
        // new Ship("cruiser", 3),
        // new Ship("submarine", 3),
        new Ship("destroyer", 2),
      ];
    }

    get nextToPlace() {
      return this.#ships.find((ship) => ship.positions.length === 0);
    }

    get areAllShipsPlacedOnBoard() {
      return this.#ships.every((ship) => ship.positions.length !== 0);
    }

    get fleetPositions() {
      return this.#ships.map((ship) => ship.positions).flat(1);
    }

    get isFleetSunk() {
      return this.#ships.every(
        (ship) => ship.positions.length === ship.hitPositions.length
      );
    }

    findShipOnPosition(position) {
      return this.#ships.find((ship) => ship.isHit(position));
    }
  }

  class Player {
    #fleet;
    #name;

    constructor() {
      this.#fleet = new Fleet();
      this.#name = generateRandomString();
      console.log(this.#name);
    }

    get areAllShipsPlacedOnBoard() {
      return this.#fleet.areAllShipsPlacedOnBoard;
    }

    get numberOfSquaresToPlaceNextShip() {
      const nextToPlace = this.#fleet.nextToPlace;
      return nextToPlace !== undefined ? nextToPlace.length : 0;
    }

    get nextToPlace() {
      return this.#fleet.nextToPlace;
    }

    get isFleetSunk() {
      return this.#fleet.isFleetSunk;
    }

    get name() {
      return this.#name;
    }

    tryToPlaceShip(startingPosition, shipPlacementDirection) {
      const nextToPlace = this.#fleet.nextToPlace;
      const numberOfSquaresToPlaceNextShip =
        nextToPlace !== undefined ? nextToPlace.length : 0;
      const { x, y } = startingPosition;
      let canPlace =
        shipPlacementDirection == Game.SHIP_PLACEMENT_DIRECTION.HORIZONTALLY
          ? x + numberOfSquaresToPlaceNextShip <= 8
          : y + numberOfSquaresToPlaceNextShip <= 8;
      if (!canPlace) {
        return false;
      }
      const positions = [];
      const fleetPositions = this.#fleet.fleetPositions;
      for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
        const position =
          shipPlacementDirection == Game.SHIP_PLACEMENT_DIRECTION.HORIZONTALLY
            ? new Position(x + i, y)
            : new Position(x, y + i);
        positions.push(position);
      }
      canPlace = !positions.some((position) =>
        fleetPositions.some(
          (pos) => pos.x === position.x && pos.y === position.y
        )
      );
      if (canPlace) {
        this.#fleet.nextToPlace.positions = positions;
      }
      return canPlace;
    }

    takeHit(position) {
      const ship = this.#fleet.findShipOnPosition(position);
      if (ship) {
        ship.hitPosition = position;
      }
      return ship;
    }
  }

  class AIPlayer extends Player {
    #hits;

    constructor() {
      super();
      this.#hits = [];
    }

    placeShips() {
      while (!this.areAllShipsPlacedOnBoard) {
        const shipPlacementDirection =
          Math.random() > 0.5
            ? Game.SHIP_PLACEMENT_DIRECTION.HORIZONTALLY
            : Game.SHIP_PLACEMENT_DIRECTION.VERTICALLY;
        const x = this.#generateRandomPosition();
        const y = this.#generateRandomPosition();
        const position = new Position(x, y);
        this.tryToPlaceShip(position, shipPlacementDirection);
        if (!this.areAllShipsPlacedOnBoard) {
          this.placeShips();
        }
      }
    }

    getShotPosition() {
      const x = this.#generateRandomPosition();
      const y = this.#generateRandomPosition();
      const position = new Position(x, y);
      const wasPositionAlreadyShot = this.#hits.some(
        (pos) => pos.x === position.x && pos.y === position.y
      );
      if (wasPositionAlreadyShot) {
        this.getShotPosition();
      }
      return position;
    }

    #generateRandomPosition() {
      return Math.floor(Math.random() * 7 + 1);
    }
  }

  class RealPlayer extends Player {
    #webSocketManager;

    constructor(webSocketManager) {
      super();
      this.#webSocketManager = webSocketManager;
    }

    // TODO: remove method and send message from event listener (?)
    takeHit(position, from) {
      this.#webSocketManager.sendMessage({
        status: WebSocketManager.MESSAGE_STATUS.ATTACK_START.description,
        position: position.asString,
        from,
      });
    }
  }

  class Game {
    static GAME_MODE = Object.freeze({
      PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
      PLAYER_VS_AI: Symbol("playerVsAI"),
    });
    static PLAYER_TYPE = Object.freeze({
      PLAYER: Symbol("player"),
      ENEMY: Symbol("enemy"),
    });
    static SHIP_PLACEMENT_DIRECTION = Object.freeze({
      HORIZONTALLY: Symbol("horizontally"),
      VERTICALLY: Symbol("vertically"),
    });
    #board;
    #gameMode;
    #shipPlacementDirection = Game.SHIP_PLACEMENT_DIRECTION.VERTICALLY;
    #player;
    #enemy;
    #gameId;
    #webSocketManager;

    constructor(board) {
      this.#board = board;
      this.#player = new Player();
      this.#webSocketManager = new WebSocketManager(this, this.#board);
      this.#board.setupElementsVisibility();
    }

    get player() {
      return this.#player;
    }

    get enemy() {
      return this.#enemy;
    }

    set gameMode(gameMode) {
      this.#gameMode = gameMode;
      const isPlayerVsPlayerMode =
        this.#gameMode === Game.GAME_MODE.PLAYER_VS_PLAYER;
      this.#enemy = isPlayerVsPlayerMode
        ? new RealPlayer(this.#webSocketManager)
        : new AIPlayer();
      if (!isPlayerVsPlayerMode) {
        this.#board.generatePlayerBoard();
      }
    }

    get shipPlacementDirection() {
      return this.#shipPlacementDirection;
    }

    set shipPlacementDirection(shipPlacementDirection) {
      this.#shipPlacementDirection = shipPlacementDirection;
    }

    get gameId() {
      return this.#gameId;
    }

    set gameId(gameId) {
      this.#gameId = gameId;
      this.#webSocketManager.initializeMethods();
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
    #createNewGameBtn;
    #joinGameFirstStepBtn;
    #joinGameSecondStepBtn;
    #joinGameInput;
    #joinGameLabel;
    #waitContainer;
    #boardMessage;
    #horizontalShipPlacementBtn;
    #verticalShipPlacementBtn;
    #shipToPlaceName;
    #resultMessageContainer;
    #resultMessage;

    constructor() {
      this.#playerBoard = document.querySelector(
        ".board--player .board__squares"
      );
      this.#enemyBoard = document.querySelector(
        ".board--enemy .board__squares"
      );
      this.#playerVsPlayerOptionBtn = document.querySelector(
        "#player_vs_player_button"
      );
      this.#playerVsAIOptionBtn = document.querySelector(
        "#player_vs_ai_button"
      );
      this.#createNewGameBtn = document.querySelector(
        "#create_new_game_button"
      );
      this.#joinGameFirstStepBtn = document.querySelector(
        "#join_game_button_first_step"
      );
      this.#joinGameSecondStepBtn = document.querySelector(
        "#join_game_button_second_step"
      );
      this.#joinGameInput = document.querySelector("#join_game_input");
      this.#joinGameLabel = document.querySelector("#join_game_label");
      this.#waitContainer = document.querySelector(
        ".board__squares_wait_container"
      );
      this.#boardMessage = document.querySelector(".board__message");
      this.#enemyBoard = document.querySelector(
        ".board--enemy .board__squares"
      );
      this.#playerVsPlayerOptionBtn.addEventListener("click", () => {
        this.#startGameMode(Game.GAME_MODE.PLAYER_VS_PLAYER);
        this.#toggleOnOffElement(this.#playerVsPlayerOptionBtn);
        this.#toggleOnOffElement(this.#playerVsAIOptionBtn);
        this.#toggleOnOffElement(this.#createNewGameBtn);
        this.#toggleOnOffElement(this.#joinGameFirstStepBtn);
      });
      this.#playerVsAIOptionBtn.addEventListener("click", () => {
        this.#toggleOnOffElement(this.#playerVsPlayerOptionBtn);
        this.#toggleOnOffElement(this.#playerVsAIOptionBtn);
        this.#startGameMode(Game.GAME_MODE.PLAYER_VS_AI);
      });
      this.#createNewGameBtn.addEventListener("click", () => {
        this.#toggleOnOffElement(this.#createNewGameBtn);
        this.#toggleOnOffElement(this.#joinGameFirstStepBtn);
        const gameId = generateRandomString();
        this.#game.gameId = gameId;
        this.generatePlayerBoard();
        this.#toggleOnOffElement(this.#boardMessage);
        this.#waitContainer.style.display = "flex";
        this.#boardMessage.innerHTML = `Waiting for a second player to join your game. Game id: <span class='board__game_id'>${gameId}</span>`;
      });
      this.#joinGameFirstStepBtn.addEventListener("click", () => {
        this.#toggleOnOffElement(this.#createNewGameBtn);
        this.#toggleOnOffElement(this.#joinGameFirstStepBtn);
        this.#toggleOnOffElement(this.#joinGameSecondStepBtn);
        this.#toggleOnOffElement(this.#joinGameInput);
        this.#toggleOnOffElement(this.#joinGameLabel);
      });
      this.#joinGameSecondStepBtn.addEventListener("click", () => {
        console.log(this.#joinGameInput.value);
        if (this.#joinGameInput.value === "") {
          return;
        }
        this.#toggleOnOffElement(this.#joinGameSecondStepBtn);
        this.#toggleOnOffElement(this.#joinGameInput);
        this.#toggleOnOffElement(this.#joinGameLabel);
        this.#game.gameId = this.#joinGameInput.value;
        this.generatePlayerBoard();
      });
      this.#horizontalShipPlacementBtn = document.querySelector(
        "#horizontal_ship_placement_button"
      );
      this.#verticalShipPlacementBtn = document.querySelector(
        "#vertital_ship_placement_button"
      );
      this.#shipToPlaceName = document.querySelector(".board__ship_name");
      this.#resultMessageContainer = document.querySelector(
        ".board__result_message__container"
      );
      this.#resultMessage = document.querySelector(".board__result_message");
      this.#playerBoardGrid = [];
      this.#enemyBoardGrid = [];
    }

    setupElementsVisibility() {
      this.#toggleOnOffElement(this.#playerBoard);
      this.#toggleOnOffElement(this.#enemyBoard);
      this.#toggleOnOffElement(this.#createNewGameBtn);
      this.#toggleOnOffElement(this.#joinGameFirstStepBtn);
      this.#toggleOnOffElement(this.#joinGameSecondStepBtn);
      this.#toggleOnOffElement(this.#joinGameInput);
      this.#toggleOnOffElement(this.#joinGameLabel);
      this.#toggleOnOffElement(this.#waitContainer);
      this.#toggleOnOffElement(this.#boardMessage);
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
      this.#toggleOnOffElement(this.#shipToPlaceName);
      this.#toggleOnOffElement(this.#resultMessageContainer);
    }

    #startGameMode(chosenGameMode) {
      this.#game.gameMode = chosenGameMode;
    }

    generatePlayerBoard() {
      this.#playerBoard.style.display = "grid";
      this.#generateBoard(
        this.#playerBoard,
        this.#playerBoardGrid,
        Game.PLAYER_TYPE.PLAYER
      );
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#horizontalShipPlacementBtn.addEventListener(
        "click",
        () =>
          (this.#game.shipPlacementDirection =
            Game.SHIP_PLACEMENT_DIRECTION.HORIZONTALLY)
      );
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
      this.#verticalShipPlacementBtn.addEventListener(
        "click",
        () =>
          (this.#game.shipPlacementDirection =
            Game.SHIP_PLACEMENT_DIRECTION.VERTICALLY)
      );
      this.#toggleOnOffElement(this.#shipToPlaceName);
    }

    #generateBoard(board, grid, squareType) {
      this.#prepareGrid(grid, squareType);
      this.#showGrid(board, grid);
      if (squareType === Game.PLAYER_TYPE.ENEMY) {
        if (this.#game.enemy instanceof RealPlayer) {
          this.#setupEnemyBoardEventListenersForRealPlayer(grid);
        } else {
          this.#setupEnemyBoardEventListenersForAIPlayer(grid);
        }
      } else {
        this.#setupPlayerBoardEventListeners(grid);
      }
    }

    #setupPlayerBoardEventListeners(grid) {
      const game = this.#game;
      const boardRef = this;
      this.#shipToPlaceName.textContent = `Select the position for your ${game.player.nextToPlace.name}`;
      grid.forEach((row) => {
        row.forEach((square) => {
          square.addEventListener("click", () => {
            // TODO: Remove event listeners after placing all ships?
            if (game.player.areAllShipsPlacedOnBoard) {
              return;
            }
            const squaresToSelect = boardRef.#selectSqaures(square, grid, game);
            if (
              game.player.numberOfSquaresToPlaceNextShip !==
              squaresToSelect.length
            ) {
              return;
            }
            const position = Position.fromString(square.dataset.position);
            const canPlace = game.player.tryToPlaceShip(
              position,
              game.shipPlacementDirection
            );
            if (canPlace) {
              squaresToSelect.forEach((el) =>
                el.classList.add(`board__square--taken`)
              );
            }
            if (game.player.areAllShipsPlacedOnBoard) {
              this.#toggleOnOffElement(this.#shipToPlaceName);
              if (game.enemy instanceof AIPlayer) {
                game.enemy.placeShips();
              }
              boardRef.generateEnemyBoard();
            } else {
              this.#shipToPlaceName.textContent = `Select the position for your ${game.player.nextToPlace.name}`;
            }
          });

          square.addEventListener("mouseover", () => {
            if (game.player.areAllShipsPlacedOnBoard) {
              return;
            }
            const squaresToSelect = boardRef.#selectSqaures(square, grid, game);
            const cssClass =
              squaresToSelect.length ===
              game.player.numberOfSquaresToPlaceNextShip
                ? `board__square--valid`
                : `board__square--invalid`;
            squaresToSelect.forEach((el) => el.classList.add(cssClass));
          });

          square.addEventListener("mouseleave", () => {
            if (game.player.areAllShipsPlacedOnBoard) {
              return;
            }
            const squaresToUnselect = boardRef.#selectSqaures(
              square,
              grid,
              game
            );
            const numberOfSquaresToPlaceNextShip =
              game.player.numberOfSquaresToPlaceNextShip;
            for (let i = 0; i <= numberOfSquaresToPlaceNextShip; i++) {
              const el = squaresToUnselect[i];
              if (el) {
                el.classList.remove(
                  ...[`board__square--valid`, `board__square--invalid`]
                );
              }
            }
          });
        });
      });
    }

    #setupEnemyBoardEventListenersForAIPlayer(grid) {
      const game = this.#game;
      grid.forEach((row) => {
        row.forEach((square) => {
          square.addEventListener("click", () => {
            if (
              square.classList.contains(
                ...[`board__square--hit`, `board__square--miss`]
              )
            ) {
              return;
            }
            const position = Position.fromString(square.dataset.position);
            const ship = game.enemy.takeHit(position);
            this.changeEnemySquareClass(square, ship !== undefined);
            if (ship) {
              if (game.enemy.isFleetSunk) {
                this.displayResult(true);
              }
            } else {
              let shouldTakeTurn = true;
              while (shouldTakeTurn) {
                const enemyAttackPosition = game.enemy.getShotPosition();
                const playerShip = game.player.takeHit(enemyAttackPosition);
                shouldTakeTurn = playerShip !== undefined;
                console.log(enemyAttackPosition);
                this.changePlayerSquareClass(
                  enemyAttackPosition.asString,
                  shouldTakeTurn
                );
              }
              if (game.player.isFleetSunk) {
                this.displayResult(false);
              }
            }
          });
        });
      });
    }

    #setupEnemyBoardEventListenersForRealPlayer(grid) {
      const game = this.#game;
      grid.forEach((row) => {
        row.forEach((square) => {
          square.addEventListener("click", () => {
            if (
              square.classList.contains(
                ...[`board__square--hit`, `board__square--miss`]
              )
            ) {
              return;
            }
            const position = Position.fromString(square.dataset.position);
            game.enemy.takeHit(position, game.player.name);
          });
        });
      });
    }

    displayResult(result) {
      this.#resultMessageContainer.style.display = "flex";
      this.#resultMessage.textContent = result ? "You won" : "You lose";
    }

    changeEnemySquareClass(square, isHit) {
      square.classList.add(
        isHit ? `board__square--enemy-hit` : `board__square--enemy-miss`
      );
    }

    changePlayerSquareClass(position, isHit) {
      const square = this.#playerBoardGrid
        .flat(1)
        .find((el) => el.dataset.position === position);
      square.classList.add(
        isHit ? `board__square--player-hit` : `board__square--player-miss`
      );
    }

    #prepareGrid(grid, squareType) {
      let letterCounter = "A";
      for (let row = 0; row < 8; row++) {
        let rowOfSquares = [];
        for (let column = 0; column < 8; column++) {
          const square = document.createElement("div");
          square.classList.add(
            ...["board__square", `board__square--${squareType.description}`]
          );
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

    #selectSqaures(square, grid, game) {
      const numberOfSquaresToPlaceNextShip =
        game.player.numberOfSquaresToPlaceNextShip;
      const rowOfSquares = grid.find((row) => row.includes(square));
      const squareColumnIndex = rowOfSquares.indexOf(square);
      const squareRowIndex = grid.indexOf(rowOfSquares);
      const squaresToSelect = [];
      if (squareColumnIndex === 0 || squareRowIndex === 0) {
        return [];
      }
      if (
        game.shipPlacementDirection ===
        Game.SHIP_PLACEMENT_DIRECTION.HORIZONTALLY
      ) {
        for (let i = 0; i < numberOfSquaresToPlaceNextShip; i++) {
          const el = rowOfSquares[squareColumnIndex + i];
          if (
            squareColumnIndex + i < 8 &&
            !el.classList.contains(`board__square--taken`)
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
            !el.classList.contains(`board__square--taken`)
          ) {
            squaresToSelect.push(el);
          }
        }
      }
      return squaresToSelect;
    }

    generateEnemyBoard() {
      this.#toggleOnOffElement(this.#horizontalShipPlacementBtn);
      this.#toggleOnOffElement(this.#verticalShipPlacementBtn);
      this.#enemyBoard.style.display = "grid";
      this.#generateBoard(
        this.#enemyBoard,
        this.#enemyBoardGrid,
        Game.PLAYER_TYPE.ENEMY
      );
    }

    hideMessageContainer() {
      this.#toggleOnOffElement(this.#waitContainer);
      this.#toggleOnOffElement(this.#boardMessage);
    }

    #toggleOnOffElement(element) {
      const { style } = element;
      style.display = style.display === "none" ? "block" : "none";
    }

    set game(game) {
      this.#game = game;
    }
  }

  class WebSocketManager {
    static MESSAGE_STATUS = Object.freeze({
      JOIN_GAME: Symbol("join_game"),
      ATTACK_START: Symbol("attack_start"),
      ATTACK_RESULT: Symbol("attack_result"),
      GAME_RESULT: Symbol("game_result"),
    });

    #game;
    #board;
    #socket;

    constructor(game, board) {
      this.#game = game;
      this.#board = board;
    }

    initializeMethods() {
      this.#socket = new WebSocket(
        `ws://localhost:8080/ws/game/${this.#game.gameId}`
      );
      this.#socket.onopen = () => {
        console.log("Connected to game with id", this.#game.gameId);
        this.sendMessage({
          status: WebSocketManager.MESSAGE_STATUS.JOIN_GAME.description,
          from: this.#game.player.name,
          gameId: this.#game.gameId,
        });
      };
      this.#socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.gameId !== this.#game.gameId) {
          return;
        }
        console.log("Received message: ", event.data);
        const status = data.status;
        switch (status) {
          case WebSocketManager.MESSAGE_STATUS.JOIN_GAME.description: {
            if (data.from !== this.#game.player.name) {
              this.#board.hideMessageContainer(false);
            }
            break;
          }
          case WebSocketManager.MESSAGE_STATUS.ATTACK_START.description: {
            if (data.from === this.#game.player.name) {
              return;
            }
            const playerShip = game.player.takeHit(
              Position.fromString(data.position)
            );
            this.sendMessage({
              status: WebSocketManager.MESSAGE_STATUS.ATTACK_RESULT.description,
              result: playerShip !== undefined,
              from: data.from,
              position: data.position,
            });
            break;
          }
          case WebSocketManager.MESSAGE_STATUS.ATTACK_RESULT.description: {
            if (data.from === this.#game.player.name) {
              const square = document.querySelector(
                `.board__square--enemy[data-position="${data.position}"]`
              );
              this.#board.changeEnemySquareClass(square, data.result);
            } else {
              this.#board.changePlayerSquareClass(data.position, data.result);
              if (this.#game.player.isFleetSunk) {
                this.sendMessage({
                  status:
                    WebSocketManager.MESSAGE_STATUS.GAME_RESULT.description,
                  from: this.#game.player.name,
                });
              }
            }
            break;
          }
          case WebSocketManager.MESSAGE_STATUS.GAME_RESULT.description: {
            if (data.from === this.#game.player.name) {
              this.#board.displayResult(false);
            } else {
              this.#board.displayResult(true);
            }
            break;
          }
        }
      };
      this.#socket.onclose = () => {
        console.log("Disconnected from game");
      };
      this.#socket.onerror = (e) => {
        console.log("Error:", e);
      };
    }

    sendMessage(data) {
      if (this.#socket.readyState !== WebSocket.OPEN) {
        setTimeout(
          () =>
            this.#socket.send(JSON.stringify({ message: "Initial message" })),
          500
        );
      } else {
        data.gameId = this.#game.gameId;
        console.log("Sending message:", data);
        this.#socket.send(JSON.stringify(data));
      }
    }
  }

  const board = new Board();
  const game = new Game(board);
  board.game = game;
});
