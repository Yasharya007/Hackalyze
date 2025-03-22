import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedHackathon: null, // Stores hackathon details
};

const hackathonSlice = createSlice({
  name: "hackathon",
  initialState,
  reducers: {
    setHackathon: (state, action) => {
      state.selectedHackathon = action.payload;
    },
    clearHackathon: (state) => {
      state.selectedHackathon = null;
    },
  },
});

export const { setHackathon, clearHackathon } = hackathonSlice.actions;
export default hackathonSlice.reducer;
