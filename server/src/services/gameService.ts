import { Game } from "../models/game";

export const createGame = async (
  gameId: string,
  playerOne: { userId: string; name: string; color: string }
) => {
  const newGame = new Game({
    gameId,
    playerOne,
    gameStarted: false,
    gameIds: [],
  });

  try {
    return await newGame.save();
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const addPlayerTwoAndCreateGame = async (
  gameId: string,
  playerTwo: { userId: string; name: string; color: string }
) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error("Game not found");
    }

    console.log("Before updating playerTwo:", game);
    game.playerTwo = playerTwo;
    game.markModified("playerTwo"); // Explicitly mark playerTwo as modified
    console.log("After updating playerTwo:", game);

    game.gameStarted = true;
    game.fen = "start";
    game.currentTurn = "white";

    const savedGame = await game.save();
    console.log("Saved game:", savedGame); // Check the saved document

    return savedGame;
  } catch (error) {
    console.error("Error updating Player Two:", error);
    throw error;
  }
};

export const getCurrentGameState = async (gameId: string) => {
  try {
    const game = await Game.findOne({ gameId });
    if (!game) {
      throw new Error("game not found");
    }
    return game;
  } catch (error) {
    console.error("Error retrieving game state:", error);
    throw error;
  }
};

export const updateGameState = async (
  gameId: string,
  fen: string,
  currentTurn: "white" | "black"
) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { gameId },
      { fen, currentTurn },
      { new: true }
    );

    return updatedGame;
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};
