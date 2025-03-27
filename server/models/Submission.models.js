import mongoose from "mongoose";
import { calculateSubmissionDetails } from "../middleware/Submission.middleware.js";

const SubmissionSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        }, // Links to the student who made the submission

        hackathonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true
        }, // Links submission to a hackathon

        files: [
            {
                format: {
                    type: String,
                    enum: ["Audio", "Video", "File", "Image"],
                    required: true
                }, // Specifies the format of each file

                fileUrl: {
                    type: String,
                    required: true
                } // URL to the submitted file (video, audio, text, etc.)
            }
        ], // Array of submitted files 

        description: {
            type: String,
            default:""
        }, 
        //manual
        scores: [
            {
                parameter: { type: String, required: true }, // Evaluation parameter
                score: { type: Number, default: 0 } // Score for each parameter
            }
        ], 
        totalScore: {
            type: Number,
            default: 0
        }, // Automatically calculates the total score

        AIscores: [
            {
                parameter: { type: String, required: true }, // Evaluation parameter
                score: { type: Number, default: 0 } // Score for each parameter
            }
        ], 
        totalAIScore: {
            type: Number,
            default: 0
        }, // Automatically calculates the total AI score

        grade: {
            type: String,
            enum: ["Low", "Mid", "High"],
            default: "Low"
        }, // Assigned based on the total score

        result: {
            type: String,
            enum: ["Rejected", "Revisit to check its potential", "Shortlisted for the final"],
            default: "Rejected"
        }, // Determines result based on total score

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher"
        }, // The teacher who reviewed the submission

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Shortlisted", "Reviewed"],
            default: "Pending"
        }, // Status of the submission

        rank: {
            type: Number,
            default: null
        }, // Rank in shortlist order

        submissionTime: {
            type: Date,
            default: Date.now,
            required: true
        }, // Stores the exact time of submission

    },
    { timestamps: true }
);

// Apply Middleware
SubmissionSchema.pre("save", calculateSubmissionDetails);

export const Submission = mongoose.model("Submission", SubmissionSchema);
