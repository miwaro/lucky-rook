import { RequestHandler } from "express";
import {
  createGame as createGameService,
  updatePlayerTwo,
} from "../services/gameService";

export const createGame: RequestHandler = async (req, res) => {
  const { roomId, playerOne } = req.body;

  try {
    const game = await createGameService(roomId, playerOne);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error creating game", error });
  }
};

export const updatePlayerTwoController: RequestHandler = async (req, res) => {
  const { roomId, gameId, playerTwo } = req.body;

  try {
    const updatedGame = await updatePlayerTwo(roomId, gameId, playerTwo);
    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: "Error updating Player Two", error });
  }
};
