import { Submission } from "../models/Submission.models.js";

// Move a submission to the review folder
export const moveToReviewFolder = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.needsReview = true; // Mark submission for review
        await submission.save();

        res.json({ message: "Submission moved to review folder successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Fetch all submissions in the review folder
export const getReviewSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ needsReview: true })
            .populate("studentId", "name email")
            .populate("hackathonId", "title")
            .populate("reviewerId", "name")
            .sort({ submissionTime: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Remove a submission from the review folder (once reviewed)
export const removeFromReviewFolder = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.needsReview = false; // Remove from review
        await submission.save();

        res.json({ message: "Submission removed from review folder" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

