import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  playerOneName: string | null;
  playerTwoName: string | null;
  isPlayerOne: boolean;
  isPlayerTwo: boolean;
  receivedPlayerOneName: string | null;
  receivedPlayerTwoName: string | null;
}

const initialState: PlayerState = {
  playerOneName: null,
  playerTwoName: null,
  isPlayerOne: false,
  isPlayerTwo: false,
  receivedPlayerOneName: null,
  receivedPlayerTwoName: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerOneName: (state, action: PayloadAction<string | null>) => {
      state.playerOneName = action.payload;
    },
    setPlayerTwoName: (state, action: PayloadAction<string | null>) => {
      state.playerTwoName = action.payload;
    },
    setIsPlayerOne: (state, action: PayloadAction<boolean>) => {
      state.isPlayerOne = action.payload;
    },
    setIsPlayerTwo: (state, action: PayloadAction<boolean>) => {
      state.isPlayerTwo = action.payload;
    },
    setReceivedPlayerOneName: (state, action: PayloadAction<string | null>) => {
      state.receivedPlayerOneName = action.payload;
    },
    setReceivedPlayerTwoName: (state, action: PayloadAction<string | null>) => {
      state.receivedPlayerTwoName = action.payload;
    },
  },
});

export const {
  setPlayerOneName,
  setPlayerTwoName,
  setIsPlayerOne,
  setIsPlayerTwo,
  setReceivedPlayerOneName,
  setReceivedPlayerTwoName,
} = playerSlice.actions;

export default playerSlice.reducer;
