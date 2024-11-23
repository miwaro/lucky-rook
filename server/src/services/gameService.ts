import { Room, Game } from "../models/game";

export const createRoom = async (
  roomId: string,
  playerOne: { userId: string; name: string; color: string }
) => {
  const newRoom = new Room({
    roomId,
    playerOne,
    gameStarted: false,
    gameIds: [],
  });

  try {
    return await newRoom.save();
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const addPlayerTwoAndCreateGame = async (
  gameId: string,
  roomId: string,
  playerTwo: { userId: string; name: string; color: string }
) => {
  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      throw new Error("Room not found");
    }

    room.playerTwo = playerTwo;

    const newGame = new Game({
      roomId,
      gameId,
      fen: "start",
      currentTurn: "white",
      gameStarted: true,
    });

    const savedGame = await newGame.save();

    await Room.updateOne({ roomId }, { $push: { gameIds: gameId } });
    await room.save();

    return savedGame;
  } catch (error) {
    console.error("Error updating Player Two:", error);
    throw error;
  }
};

export const getCurrentGameState = async (roomId: string) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room || room.gameIds.length === 0) {
      throw new Error("Room or current game not found");
    }

    const lastGameId = room.gameIds[room.gameIds.length - 1];

    const game = await Game.findOne({ gameId: lastGameId });

    if (!game) {
      throw new Error("Game not found");
    }

    return game;
  } catch (error) {
    console.error("Error retrieving game state:", error);
    throw error;
  }
};

export const updateGameState = async (
  roomId: string,
  fen: string,
  currentTurn: "white" | "black"
) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { roomId },
      { fen, currentTurn },
      { new: true }
    );

    return updatedGame;
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};

export const getRoomState = async (roomId: string) => {
  try {
    const room = await Room.findOne({ roomId });

    if (!room || room.gameIds.length === 0) {
      throw new Error("Room or current game not found");
    }

    return room;
  } catch (error) {
    console.error("Error retrieving game state:", error);
    throw error;
  }
};
