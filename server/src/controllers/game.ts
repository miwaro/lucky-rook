import { RequestHandler } from "express";
import {
  createRoom as createRoomService,
  addPlayerTwoAndCreateGame as addPlayerTwoAndCreateGameService,
  getCurrentGameState as getCurrentGameStateService,
  updateGameState as updateGameStateService,
} from "../services/gameService";

export const createRoom: RequestHandler = async (req, res) => {
  const { roomId, playerOne } = req.body;

  try {
    const room = await createRoomService(roomId, playerOne);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  }
};

export const addPlayerTwoAndCreateGame: RequestHandler = async (req, res) => {
  const { gameId, roomId, playerTwo } = req.body;

  try {
    const updatedGame = await addPlayerTwoAndCreateGameService(
      gameId,
      roomId,
      playerTwo
    );
    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: "Error updating Player Two", error });
  }
};

export const getCurrentGameState: RequestHandler = async (req, res) => {
  const { roomId } = req.params;

  console.log("roomID in CONTROLLER: ", roomId);

  try {
    const gameState = await getCurrentGameStateService(roomId);
    res.status(200).json(gameState);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Game State", error });
  }
};

export const updateGameState: RequestHandler = async (req, res) => {
  const { roomId } = req.params;
  const { fen, currentTurn } = req.body;

  try {
    const updatedGame = await updateGameStateService(roomId, fen, currentTurn);
    if (!updatedGame) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    res.json(updatedGame);
  } catch (error) {
    console.error("Error updating game state:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
