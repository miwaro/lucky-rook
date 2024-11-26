import express from "express";
import {
  addPlayerOne,
  addPlayerTwo,
  getCurrentGameState,
  updateGameState,
  createRematch,
  startGame,
} from "../controllers/game";

const router = express.Router();

router.post("/games/add-player-one", addPlayerOne);
router.post("/games/:gameId/add-player-two", addPlayerTwo);
router.post("/games/:gameId/start-game", startGame);
router.post("/games/:gameId/rematch", createRematch);

// Only These two routes are being accessed from the client
router.get("/games/:gameId/current-game", getCurrentGameState);
router.put("/games/:gameId", updateGameState);

export default router;
