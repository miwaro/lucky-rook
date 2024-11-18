import Game from "../models/game";
import { v4 as uuidv4 } from "uuid";

export const createGame = async (
  roomId: string,
  playerOne: { userId: string; name: string; color: string }
) => {
  const gameId = uuidv4();
  const newGame = new Game({
    gameId,
    roomId,
    playerOne,
    playerTwo: {
      userId: null,
      name: null,
      color: "black",
    },
    fen: "rnbqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
    currentTurn: "white",
  });

  try {
    return await newGame.save();
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const updatePlayerTwo = async (
  roomId: string,
  gameId: string,
  playerTwo: { userId: string; name: string; color: string }
) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { roomId, gameId },
      { playerTwo },
      { new: true }
    );

    if (!updatedGame) {
      throw new Error("Game not found");
    }

    return updatedGame;
  } catch (error) {
    console.error("Error updating Player Two:", error);
    throw error;
  }
};
