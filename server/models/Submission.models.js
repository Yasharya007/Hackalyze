import mongoose from "mongoose";
import { calculateSubmissionDetails } from "../middleware/Submission.middleware.js";

const SubmissionSchema = new mongoose.Schema({
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

    format: {
        type: String,
        enum: ["Audio", "Video", "File"],
        required: true
    }, // Specifies the format of the submission (text document, audio file, video, etc.)

   fileUrl: {
        type: String,
        required: true
    }, // URL to the submitted file (video, audio, text, etc.)

    description: {
        type: String,
        required: true
    }, // Brief explanation of the submission

    scores: [
        {
            parameter: { type: String, required: true }, // evaluation parameter
            score: { type: Number, default: 0 } // Score for each parameter
        }
    ], // Dynamic list of scoring parameters

    totalScore: {
        type: Number,
        default: 0
    }, // Automatically calculates the total score

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
        enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"],
        default: "Pending"
    }, // Tracks submission review progress

    submissionTime: {
        type: Date,
        default: Date.now,
        required: true
    }, // Stores the exact time of submission
    needsReview: { type: Boolean, default: false } // NEW FIELD

    
},{timestamps:true});

// Apply Middleware
SubmissionSchema.pre("save", calculateSubmissionDetails); 
    

export const Submission= mongoose.model("Submission", SubmissionSchema);
