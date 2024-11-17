import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";

interface GameState {
  fen: string;
  boardOrientation: "white" | "black";
  currentTurn: "white" | "black";
  gameStarted: boolean;
}

const initialState: GameState = {
  fen: new Chess().fen(),
  boardOrientation: "white",
  currentTurn: "white",
  gameStarted: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setFen: (state, action: PayloadAction<string>) => {
      state.fen = action.payload;
    },
    setBoardOrientation: (state, action: PayloadAction<"white" | "black">) => {
      state.boardOrientation = action.payload;
    },
    setCurrentTurn: (state, action) => {
      state.currentTurn = action.payload;
    },
    setGameStarted: (state, action: PayloadAction<boolean>) => {
      state.gameStarted = action.payload;
    },
  },
});

export const { setFen, setBoardOrientation, setGameStarted, setCurrentTurn } = gameSlice.actions;
export default gameSlice.reducer;
