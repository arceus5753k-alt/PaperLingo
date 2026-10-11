import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
};

const darkModeSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { setMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;