import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../models/user";
import { v4 as uuidv4 } from "uuid";

interface PlayerState {
  playerOneName: string;
  playerOneId: string;
  playerTwoName: string;
  playerTwoId: string;
  isPlayerOne: boolean;
  isPlayerTwo: boolean;
  receivedPlayerOneName: string | null;
  receivedPlayerTwoName: string | null;
  loggedInUser: User | null;
  isPlayerOneConnected: boolean;
  isPlayerTwoConnected: boolean;
}

const initialState: PlayerState = {
  playerOneName: "anonymous",
  playerOneId: uuidv4(),
  playerTwoName: "anonymous",
  playerTwoId: uuidv4(),
  isPlayerOne: false,
  isPlayerTwo: false,
  receivedPlayerOneName: null,
  receivedPlayerTwoName: null,
  loggedInUser: null,
  isPlayerOneConnected: false,
  isPlayerTwoConnected: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerOneName: (state, action: PayloadAction<string>) => {
      state.playerOneName = action.payload;
    },
    setPlayerOneId: (state, action: PayloadAction<string>) => {
      state.playerOneId = action.payload;
    },
    setPlayerTwoName: (state, action: PayloadAction<string>) => {
      state.playerTwoName = action.payload;
    },
    setPlayerTwoId: (state, action: PayloadAction<string>) => {
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
    setIsPlayerOneConnected: (state, action: PayloadAction<boolean>) => {
      state.isPlayerOneConnected = action.payload;
    },
    setIsPlayerTwoConnected: (state, action: PayloadAction<boolean>) => {
      state.isPlayerTwoConnected = action.payload;
    },
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
  setIsPlayerOneConnected,
  setIsPlayerTwoConnected,
} = playerSlice.actions;

export default playerSlice.reducer;
