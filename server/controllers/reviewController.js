import { Submission } from "../models/Submission.models.js";

// Move a submission to the review folder
export const markSubmissionAsReviewed = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Update status to "Reviewed" and return the updated submission
        const updatedSubmission = await Submission.findByIdAndUpdate(
            submissionId,
            { status: "Reviewed" }, // Set status to "Reviewed"
            { new: true } // Return updated document
        );

        if (!updatedSubmission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.json({ 
            message: "Submission marked as Reviewed successfully", 
            success: true,
            submission: updatedSubmission  // Return updated submission
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server error", 
            error: error.message, 
            success: false 
        });
    }
};


// Fetch all submissions in the review folder
export const getReviewedSubmissions = async (req, res) => {
    try {
        //Fetch submissions where status is "Reviewed"
        const submissions = await Submission.find({ status: "Reviewed" })
            .populate("studentId", "name email")
            .populate("hackathonId", "title")
            .populate("reviewerId", "name")
            .sort({ submissionTime: -1 });

        res.json({
            success: true,
            message: "Reviewed submissions fetched successfully",
            submissions
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Remove a submission from the review folder (once reviewed)
export const markSubmissionAsPending = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Update status to "Pending" and return the updated submission
        const updatedSubmission = await Submission.findByIdAndUpdate(
            submissionId,
            { status: "Pending" }, // Set status to "Pending"
            { new: true } // Return updated document
        );

        if (!updatedSubmission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.json({ 
            message: "Submission status reset to Pending successfully", 
            success: true,
            submission: updatedSubmission  // Return updated submission
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server error", 
            error: error.message, 
            success: false 
        });
    }
};
