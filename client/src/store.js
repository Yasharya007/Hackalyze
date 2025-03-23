import { configureStore } from "@reduxjs/toolkit";
import hackathonReducer from "./slices/hackathonSlice.js";
import studentReducer from "./slices/idSlice.js"
const store = configureStore({
  reducer: {
    hackathon: hackathonReducer,
    student: studentReducer,
  },
});

export default store;
