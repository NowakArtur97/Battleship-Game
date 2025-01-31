document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = document.querySelector(".board--player");
  const playerBoardGrid = playerBoard.querySelector(".squares");
  const enemyBoard = document.querySelector(".board--enemy");
  const enemyBoardGrid = enemyBoard.querySelector(".squares");

  playerBoardGrid.style.display = "none";
  enemyBoardGrid.style.display = "none";
});
