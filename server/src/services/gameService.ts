import { Game } from "../models/game";
import { v4 as uuidv4 } from "uuid";

export const addPlayerOne = async (
  gameId: string,
  playerOne: { userId: string; name: string; color: string }
) => {
  const newGame = new Game({
    gameId,
    playerOne,
    gameStarted: false,
  });

  try {
    return await newGame.save();
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const addPlayerTwo = async (
  gameId: string,
  playerTwo: { userId: string; name: string; color: string }
) => {
  if (!playerTwo.userId || !playerTwo.name) {
    console.error("Invalid Player Two data:", playerTwo);
    throw new Error("PlayerTwo object is invalid");
  }

  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error("Game not found");
    }

    game.set("playerTwo", playerTwo);

    const savedGame = await game.save();

    return savedGame;
  } catch (error) {
    console.error("Error updating Player Two:", error);
    throw error;
  }
};

export const startGame = async (gameId: string) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error("Game not found");
    }

    game.gameStarted = true;
    game.fen = "start";
    game.currentTurn = "white";

    const savedGame = await game.save();

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
  currentTurn: "white" | "black",
  moves: any
) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { gameId },
      { fen, currentTurn, moves },
      { new: true }
    );

    return updatedGame;
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};

export const createRematch = async (gameId: string) => {
  const newGameId = uuidv4().slice(0, 8);
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error("Game not found");
    }

    const newGame = new Game({
      gameId: newGameId,
      playerOne: game.playerOne,
      playerTwo: game.playerTwo,
      gameStarted: true,
      fen: "start",
      currentTurn: "white",
    });

    return await newGame.save();
  } catch (error) {
    console.error("Error creating new game:", error);
    throw error;
  }
};
