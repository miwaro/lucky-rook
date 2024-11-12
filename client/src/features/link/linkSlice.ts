import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LinkState {
  link: string;
}

const initialState: LinkState = {
  link: "",
};

const linkSlice = createSlice({
  name: "link",
  initialState,
  reducers: {
    setLink: (state, action: PayloadAction<string>) => {
      state.link = action.payload;
    },
  },
});

export const { setLink } = linkSlice.actions;
export default linkSlice.reducer;
