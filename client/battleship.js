document.addEventListener("DOMContentLoaded", () => {
  const GAME_MODE = Object.freeze({
    PLAYER_VS_PLAYER: Symbol("playerVsPlayer"),
    PLAYER_VS_AI: Symbol("playerVsAI"),
  });

  const playerBoard = document.querySelector(".board--player");
  const playerBoardGrid = playerBoard.querySelector(".squares");
  const enemyBoard = document.querySelector(".board--enemy");
  const enemyBoardGrid = enemyBoard.querySelector(".squares");

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
