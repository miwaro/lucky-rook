import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../models/user";

interface PlayerState {
  playerOneName: string;
  playerOneId: string | null;
  playerTwoName: string;
  playerTwoId: string | null;
  isPlayerOne: boolean;
  isPlayerTwo: boolean;
  receivedPlayerOneName: string | null;
  receivedPlayerTwoName: string | null;
  loggedInUser: User | null;
}

const initialState: PlayerState = {
  playerOneName: "anonymous",
  playerOneId: null,
  playerTwoName: "anonymous",
  playerTwoId: null,
  isPlayerOne: false,
  isPlayerTwo: false,
  receivedPlayerOneName: null,
  receivedPlayerTwoName: null,
  loggedInUser: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerOneName: (state, action: PayloadAction<string>) => {
      state.playerOneName = action.payload;
    },
    setPlayerOneId: (state, action: PayloadAction<string | null>) => {
      state.playerOneId = action.payload;
    },
    setPlayerTwoName: (state, action: PayloadAction<string>) => {
      state.playerTwoName = action.payload;
    },
    setPlayerTwoId: (state, action: PayloadAction<string | null>) => {
      state.playerTwoId = action.payload;
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
    setLoggedInUser: (state, action: PayloadAction<User | null>) => {
      state.loggedInUser = action.payload;
    },
    resetPlayerState: () => initialState,
  },
});

export const {
  setPlayerOneName,
  setPlayerOneId,
  setPlayerTwoName,
  setPlayerTwoId,
  setIsPlayerOne,
  setIsPlayerTwo,
  setReceivedPlayerOneName,
  setReceivedPlayerTwoName,
  setLoggedInUser,
  resetPlayerState,
} = playerSlice.actions;

export default playerSlice.reducer;
