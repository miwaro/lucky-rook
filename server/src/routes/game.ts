import express from "express";
import {
  createGame,
  addPlayerTwoAndCreateGame,
  getCurrentGameState,
  updateGameState,
} from "../controllers/game";

const router = express.Router();

router.post("/game", createGame);

router.post("/game/:gameId/start-game", addPlayerTwoAndCreateGame);

router.get("/game/:gameId/current-game", getCurrentGameState);

router.put("/games/:gameId", updateGameState);

export default router;
