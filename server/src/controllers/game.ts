import { RequestHandler } from "express";
import {
  addPlayerOne as addPlayerOneService,
  addPlayerTwo as addPlayerTwoService,
  startGame as startGameService,
  getCurrentGameState as getCurrentGameStateService,
  updateGameState as updateGameStateService,
  createRematch as createRematchService,
} from "../services/gameService";

export const addPlayerOne: RequestHandler = async (req, res) => {
  const { gameId, playerOne } = req.body;

  try {
    const game = await addPlayerOneService(gameId, playerOne);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error creating game", error });
  }
};

export const addPlayerTwo: RequestHandler = async (req, res) => {
  const { gameId, playerTwo } = req.body;

  try {
    const game = await addPlayerTwoService(gameId, playerTwo);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error adding player two", error });
  }
};

export const startGame: RequestHandler = async (req, res) => {
  const { gameId } = req.body;

  try {
    const game = await startGameService(gameId);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error starting game", error });
  }
};

export const createRematch: RequestHandler = async (req, res) => {
  const { gameId } = req.body;

  try {
    const game = await createRematchService(gameId);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error creating new game", error });
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
  const { fen, currentTurn, moves } = req.body;

  try {
    const updatedGame = await updateGameStateService(
      gameId,
      fen,
      currentTurn,
      moves
    );
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
