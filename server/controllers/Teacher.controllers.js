import { Hackathon } from "../models/Hackathon.model.js";
import { Submission } from "../models/Submission.models.js";
import { SubmissionAudit } from "../models/SubmissionAudit.models.js";

export const addParameter = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { name, description } = req.body;

        // Validate input
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required." });
        }

        // Find the hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found." });
        }

        // Check for duplicate parameter
        if (hackathon.parameters.some(param => param.name === name)) {
            return res.status(400).json({ message: "Parameter already exists." });
        }

        // Add new parameter to the hackathon
        hackathon.parameters.push({ name, description });
        await hackathon.save();

        // Fetch all submissions for this hackathon
        const submissions = await Submission.find({ hackathonId });

        // Update each submission with new parameter & AI-generated score
        for (let submission of submissions) {
            const aiScore = 10;

            //score is being calculated by the trained model

            // Append the new parameter to the scores array
            submission.scores.push({ parameter: name, score: aiScore });

            // Recalculate total score
            submission.totalScore = submission.scores.reduce((sum, entry) => sum + entry.score, 0);

            await submission.save();
        }

        res.status(201).json({ message: "Parameter added successfully and submissions updated.", parameters: hackathon.parameters });
    } catch (error) {
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};


// Delete a parameter from a hackathon
export const deleteParameter = async (req, res) => {
    try {
        const { hackathonId, parameterId } = req.params;

        // Find the hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        // Find the parameter to delete
        const parameterIndex = hackathon.parameters.findIndex(param => param._id.toString() === parameterId);
        if (parameterIndex === -1) {
            return res.status(404).json({ message: "Parameter not found" });
        }

        const parameterName = hackathon.parameters[parameterIndex].name;

        // Remove the parameter from the hackathon
        hackathon.parameters.splice(parameterIndex, 1);
        await hackathon.save();

        // Update all related submissions
        const submissions = await Submission.find({ hackathonId });

        for (let submission of submissions) {
            // Remove the parameter from scores array
            submission.scores = submission.scores.filter(entry => entry.parameter !== parameterName);
            
            // Recalculate totalScore
            submission.totalScore = submission.scores.reduce((sum, entry) => sum + entry.score, 0);

            await submission.save();
        }

        res.status(200).json({ message: "Parameter deleted successfully" });
    } catch (error) {
        console.error("Error deleting parameter:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//Update selected criteria for a hackathon
export const updateSelectedCriteria = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { selectedCriteria } = req.body; // Array of { parameter, weight }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        // Save selected criteria in Hackathon model
        hackathon.selectedCriteria = selectedCriteria;
        await hackathon.save();

        // Fetch all submissions for this hackathon
        const submissions = await Submission.find({ hackathonId });

        for (let submission of submissions) {
            let updatedScores = [];

            // Iterate over selectedCriteria to update scores
            for (let criteria of selectedCriteria) {
                let existingScore = submission.scores.find(score => score.parameter === criteria.parameter);

                updatedScores.push({
                    parameter: criteria.parameter, // Ensure parameter is always present
                    score: existingScore ? existingScore.score * criteria.weight : 0 // If not found, initialize to 0
                });
            }

            // Update scores and recalculate total score
            submission.scores = updatedScores;
            submission.totalScore = updatedScores.reduce((sum, entry) => sum + entry.score, 0);

            await submission.save();
        }

        return res.status(200).json({
            message: "Selected criteria updated successfully",
            updatedSelectedCriteria: hackathon.selectedCriteria
        });

    } catch (error) {
        console.error("Error in updateSelectedCriteria:", error);
        res.status(500).json({ message: error.message });
    }
};



//Get selected criteria for a hackathon
export const getSelectedCriteria = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        res.status(200).json(hackathon.selectedCriteria);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get all submissions assigned to a teacher for evaluation
 */
export const getSubmissionsForEvaluation = async (req, res) => {
    try {
        const { teacherId, hackathonId } = req.params;

        const submissions = await Submission.find({ hackathonId })
            .populate("studentId", "name email") // Fetch student details
            .populate("hackathonId", "title");

        if (!submissions.length) return res.status(404).json({ message: "No submissions found" });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Evaluate a submission
 */
export const evaluateSubmission = async (req, res) => {
    try {
        const { teacherId, hackathonId, submissionId } = req.params;
        const { scores } = req.body; // Array of { parameter, score }

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        submission.scores = scores;
        submission.totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        submission.reviewerId = teacherId;
        submission.status = "Reviewed";

        // Assign grade & result
        if (submission.totalScore >= 80) submission.grade = "High";
        else if (submission.totalScore >= 50) submission.grade = "Mid";
        else submission.grade = "Low";

        if (submission.totalScore >= 80) submission.result = "Shortlisted for the final";
        else if (submission.totalScore >= 50) submission.result = "Revisit to check its potential";
        else submission.result = "Rejected";

        await submission.save();
        res.status(200).json({ message: "Submission evaluated successfully", submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Shortlist students based on their submission scores
 */
export const shortlistStudents = async (req, res) => {
    try {
        const { teacherId, hackathonId } = req.params;
        const { threshold } = req.body; // Minimum score to shortlist

        const submissions = await Submission.find({ hackathonId, status: "Reviewed" });

        const shortlisted = submissions.filter(sub => sub.totalScore >= threshold);
        shortlisted.forEach(sub => (sub.status = "Shortlisted"));

        await Promise.all(shortlisted.map(sub => sub.save()));

        res.status(200).json({ message: "Students shortlisted successfully", shortlisted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get all shortlisted students
 */
export const getShortlistedStudents = async (req, res) => {
    try {
        const { teacherId, hackathonId } = req.params;

        const submissions = await Submission.find({ hackathonId, status: "Shortlisted" })
            .populate("studentId", "name email schoolCollegeName");

        if (!submissions.length) return res.status(404).json({ message: "No shortlisted students found" });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//


// Get students sorted by AI score (descending) for a particular teacher

export const getSortedByAIScore = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const submissions = await SubmissionAudit.find({ teacherId }).sort({ AItotalScore: -1 });

        if (submissions.length === 0) {
            return res.status(404).json({ message: "No submissions found for this teacher." });
        }

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
    }
};


// Get students sorted by updated score if available, otherwise AI score for a particular teacher
export const getSortedByPreference = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const submissions = await SubmissionAudit.find({ teacherId });

        if (submissions.length === 0) {
            return res.status(404).json({ message: "No submissions found for this teacher." });
        }

        // Sort by `updatedTotalScore` if available, otherwise use `AItotalScore`
        submissions.sort((a, b) => {
            const scoreA = a.updatedTotalScore ?? a.AItotalScore;
            const scoreB = b.updatedTotalScore ?? b.AItotalScore;
            return scoreB - scoreA; // Descending order
        });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
    }
};
