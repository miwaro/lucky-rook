import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";

interface GameState {
  gameId?: string | null;
  fen: string;
  boardOrientation: "white" | "black";
  currentTurn: "white" | "black";
  gameStarted: boolean;
  result: string | null;
  rematchRequestedByPlayerOne: boolean;
  rematchRequestedByPlayerTwo: boolean;
  isGameOver: boolean;
}

const initialState: GameState = {
  gameId: null,
  fen: new Chess().fen(),
  boardOrientation: "white",
  currentTurn: "white",
  gameStarted: false,
  result: null,
  rematchRequestedByPlayerOne: false,
  rematchRequestedByPlayerTwo: false,
  isGameOver: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setFen(state, action: PayloadAction<string>) {
      state.fen = action.payload;
    },
    setBoardOrientation(state, action: PayloadAction<"white" | "black">) {
      state.boardOrientation = action.payload;
    },
    setCurrentTurn(state, action) {
      state.currentTurn = action.payload;
    },
    setGameStarted(state, action: PayloadAction<boolean>) {
      state.gameStarted = action.payload;
    },
    setGameId(state, action: PayloadAction<string>) {
      state.gameId = action.payload;
    },
    setResult(state, action: PayloadAction<string>) {
      state.result = action.payload;
    },
    setRematchRequestedByPlayerOne(state, action: PayloadAction<boolean>) {
      state.rematchRequestedByPlayerOne = action.payload;
    },
    setRematchRequestedByPlayerTwo(state, action: PayloadAction<boolean>) {
      state.rematchRequestedByPlayerTwo = action.payload;
    },
    setIsGameOver(state, action: PayloadAction<boolean>) {
      state.isGameOver = action.payload;
    },
  },
});

export const {
  setFen,
  setBoardOrientation,
  setGameStarted,
  setCurrentTurn,
  setGameId,
  setResult,
  setRematchRequestedByPlayerOne,
  setRematchRequestedByPlayerTwo,
  setIsGameOver,
} = gameSlice.actions;
export default gameSlice.reducer;
