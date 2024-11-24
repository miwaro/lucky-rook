import { RequestHandler } from "express";
import {
  createGame as createGameService,
  addPlayerTwoAndCreateGame as addPlayerTwoAndCreateGameService,
  getCurrentGameState as getCurrentGameStateService,
  updateGameState as updateGameStateService,
} from "../services/gameService";

export const createGame: RequestHandler = async (req, res) => {
  const { gameId, playerOne } = req.body;

  try {
    const game = await createGameService(gameId, playerOne);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error creating game", error });
  }
};

export const addPlayerTwoAndCreateGame: RequestHandler = async (req, res) => {
  const { gameId, playerTwo } = req.body;

  try {
    const updatedGame = await addPlayerTwoAndCreateGameService(
      gameId,
      playerTwo
    );
    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: "Error updating Player Two", error });
  }
};

export const getCurrentGameState: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  try {
    const gameState = await getCurrentGameStateService(gameId);
    res.status(200).json(gameState);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Game State", error });
  }
};

export const updateGameState: RequestHandler = async (req, res) => {
  const { gameId } = req.params;
  const { fen, currentTurn } = req.body;

  try {
    const updatedGame = await updateGameStateService(gameId, fen, currentTurn);
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
