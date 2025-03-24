import mongoose from "mongoose";

const SubmissionAuditSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
        required: true
    }, // Links to the specific submission being modified

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    }, // Teacher who modified the score

    AItotalScore: {
        type: Number,
        required: true
    }, // Original total score given by AI

    AIscore: [
        {
            parameter: { type: String, required: true },
            score: { type: Number, required: true }
        }
    ], // Original AI-assigned scores parameter-wise

    updatedScore: [
        {
            parameter: { type: String, required: true },
            score: { type: Number, required: true }
        }
    ], // Manually updated scores parameter-wise

    updatedTotalScore: {
        type: Number,
        required: true
    }, // New total score after manual modification

    remark: {
        type: String,
    }, // Reason or justification for modification

    modifiedAt: {
        type: Date,
        default: Date.now
    } // Timestamp when modification was made

}, { timestamps: true });

export const SubmissionAudit = mongoose.model("SubmissionAudit", SubmissionAuditSchema);
