import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema({
    questions: {
        type: [String], // Array of FAQ questions
        required: true
    },
    answers: {
        type: [String], // Array of corresponding answers
        required: true
    }
}, { timestamps: true });

export const FAQ= mongoose.model("FAQ", FAQSchema);
