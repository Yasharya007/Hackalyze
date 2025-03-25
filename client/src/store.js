import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // Uses localStorage for persistence
import { persistStore, persistReducer } from "redux-persist";
import hackathonReducer from "./slices/hackathonSlice.js";
import studentReducer from "./slices/idSlice.js";
import submissionReducer from "./slices/submissionSlice.js";

// Persist configuration
const hackathonPersistConfig = {
  key: "hackathon",
  storage
};

const studentPersistConfig = {
  key: "student",
  storage
};

const submissionPersistConfig = {
  key: "submission",
  storage
};

// Wrap reducers with persistReducer
const persistedHackathonReducer = persistReducer(hackathonPersistConfig, hackathonReducer);
const persistedStudentReducer = persistReducer(studentPersistConfig, studentReducer);
const persistedsubmissionReducer = persistReducer(submissionPersistConfig,submissionReducer);
const store = configureStore({
  reducer: {
    hackathon: persistedHackathonReducer,
    student: persistedStudentReducer,
    submission:persistedsubmissionReducer
  }
});

export const persistor = persistStore(store);
export default store;
