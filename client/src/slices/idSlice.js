import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentId: null, // Stores only the student ID
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudentId: (state, action) => { 
      state.studentId = action.payload; 
    },
    clearStudentId: (state) => { 
      state.studentId = null; 
    },
  },
});

//  Correct export
export const { setStudentId, clearStudentId } = studentSlice.actions;
export default studentSlice.reducer;
