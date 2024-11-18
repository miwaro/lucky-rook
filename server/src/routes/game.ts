import express from "express";
import { createGame, updatePlayerTwoController } from "../controllers/game";

const router = express.Router();

router.post("/games", createGame);

router.put("/games/playerTwo", updatePlayerTwoController);

export default router;
