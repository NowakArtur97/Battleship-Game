document.addEventListener("DOMContentLoaded", () => {
  const GAME_MODE = Object.freeze({
    PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
    PLAYER_VS_AI: Symbol("playerVsAI"),
  });

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
    generateBoard();
  }

  function generateBoard() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = document.createElement("div");
        square.classList.add(...["square", "square--player"]);
        if (i !== 0 && j !== 0) {
          square.dataset.position = `${i}${j}`;
          square.textContent = `${i}${j}`;
        }
        playerBoardGrid.appendChild(square);
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
