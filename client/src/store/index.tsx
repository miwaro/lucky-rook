import { configureStore } from "@reduxjs/toolkit";
import linkReducer from "../features/link/linkSlice";
import playerReducer from "../features/player/playerSlice";
import gameReducer from "../features/game/gameSlice";

export const store = configureStore({
  reducer: {
    link: linkReducer,
    player: playerReducer,
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
