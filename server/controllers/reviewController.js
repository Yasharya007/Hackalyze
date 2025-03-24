import { Submission } from "../models/Submission.models.js";

// Mark a submission to the review folder
export const markSubmissionAsReviewed = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.status = "Reviewed"; // Update status to "Reviewed"
        await submission.save();

        res.json({ message: "Submission marked as Reviewed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Fetch all submissions that are reviewed 
export const getReviewSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ status: "Reviewed" })
            .populate("studentId", "name email")
            .populate("hackathonId", "title")
            .populate("reviewerId", "name")
            .sort({ submissionTime: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Remove a submission from the review (once reviewed)
export const markSubmissionAsPending = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.status = "Pending"; // Set status back to "Pending"
        await submission.save();

        res.json({ message: "Submission status reset to Pending successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


