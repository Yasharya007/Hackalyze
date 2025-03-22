import { configureStore } from "@reduxjs/toolkit";
import hackathonReducer from "./slices/hackathonSlice.js";

const store = configureStore({
  reducer: {
    hackathon: hackathonReducer,
  },
});

export default store;
