import express from "express";
import {
  addPlayerOne,
  addPlayerTwo,
  getCurrentGameState,
  updateGameState,
  createRematch,
} from "../controllers/game";

const router = express.Router();

router.post("/game", addPlayerOne);
router.post("/game/:gameId/start-game", addPlayerTwo);
router.post("/game", createRematch);

router.get("/game/:gameId/current-game", getCurrentGameState);

router.put("/games/:gameId", updateGameState);

export default router;
