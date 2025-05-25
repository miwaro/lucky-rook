import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";

interface Move {
  fen: string;
  moveNumber: number;
  color: "white" | "black";
  from: string;
  to: string;
}

interface GameState {
  gameId?: string | null;
  fen: string;
  boardOrientation: "white" | "black";
  currentTurn: "white" | "black";
  gameStarted: boolean;
  result: string | null;
  isGameOver: boolean;
  moves: Move[];
  rematch: {
    requestedByPlayerOne: boolean;
    requestedByPlayerTwo: boolean;
    message: string;
    waiting: boolean;
  };
}

const initialState: GameState = {
  gameId: null,
  fen: new Chess().fen(),
  boardOrientation: "white",
  currentTurn: "white",
  gameStarted: false,
  result: null,
  isGameOver: false,
  moves: [],
  rematch: {
    requestedByPlayerOne: false,
    requestedByPlayerTwo: false,
    message: "Rematch",
    waiting: false,
  },
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
    setIsGameOver(state, action: PayloadAction<boolean>) {
      state.isGameOver = action.payload;
    },
    setMoves(state, action: PayloadAction<Move[]>) {
      state.moves = action.payload;
    },
    addMove(state, action: PayloadAction<Move>) {
      state.moves.push(action.payload);
    },
    setRematchRequestedByPlayer(state, action: PayloadAction<{ player: "one" | "two"; requested: boolean }>) {
      if (action.payload.player === "one") {
        state.rematch.requestedByPlayerOne = action.payload.requested;
      } else {
        state.rematch.requestedByPlayerTwo = action.payload.requested;
      }
    },
    setRematchMessage(state, action: PayloadAction<string>) {
      state.rematch.message = action.payload;
    },
    setWaitingForRematch(state, action: PayloadAction<boolean>) {
      state.rematch.waiting = action.payload;
    },
    resetRematchState(state) {
      state.rematch = {
        requestedByPlayerOne: false,
        requestedByPlayerTwo: false,
        message: "Rematch",
        waiting: false,
      };
    },
    updateRematchState(
      state,
      action: PayloadAction<{
        requestedByPlayerOne: boolean;
        requestedByPlayerTwo: boolean;
        message: string;
        waiting: boolean;
      }>
    ) {
      state.rematch = action.payload;
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
  setRematchMessage,
  setIsGameOver,
  setMoves,
  addMove,
  setWaitingForRematch,
  setRematchRequestedByPlayer,
  updateRematchState,
} = gameSlice.actions;

export default gameSlice.reducer;
