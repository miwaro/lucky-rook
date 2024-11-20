import express from "express";
import {
  createRoom,
  addPlayerTwoAndCreateGame,
  getCurrentGameState,
  updateGameState,
} from "../controllers/game";

const router = express.Router();

router.post("/room", createRoom);

router.post("/room/:roomId/start-game", addPlayerTwoAndCreateGame);

router.get("/room/:roomId/current-game", getCurrentGameState);

router.put("/games/:roomId", updateGameState);

export default router;
