import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedSubmissionId: null // Store the selected submission ID
};

const submissionSlice = createSlice({
    name: "submission",
    initialState,
    reducers: {
        setSelectedSubmissionId: (state, action) => {
            state.selectedSubmissionId = action.payload;
        },
        clearSelectedSubmissionId: (state) => {
            state.selectedSubmissionId = null;
        }
    }
});

// Export actions
export const { setSelectedSubmissionId, clearSelectedSubmissionId } = submissionSlice.actions;

// Export reducer
export default submissionSlice.reducer;
