import { Hackathon } from "../models/Hackathon.model.js";
import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";

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
            const aiScore = 0;

            //score is being calculated by the trained model

            // Append the new parameter to the scores array
            submission.AIscores.push({ parameter: name, score: aiScore });

            // Recalculate total score
            submission.totalAIScore = submission.AIscores.reduce((sum, entry) => sum + entry.score, 0);

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
            submission.AIscores = submission.AIscores.filter(entry => entry.parameter !== parameterName);
            
            // Recalculate totalScore
            submission.totalAIScore = submission.AIscores.reduce((sum, entry) => sum + entry.score, 0);

            await submission.save();
        }

        res.status(200).json({ message: "Parameter deleted successfully" });
    } catch (error) {
        console.error("Error deleting parameter:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//save selected criteria for a hackathon
export const saveSelectedCriteria = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { selectedCriteria } = req.body; // Expecting array [{name, weight}]

        // Find and update hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        // Update selectedCriteria in Hackathon
        hackathon.selectedCriteria = selectedCriteria;
        await hackathon.save();

        // Fetch all submissions for the given hackathon
        const submissions = await Submission.find({ hackathonId });
        for (let submission of submissions) {
            let updatedScores = [];
            for (let criteria of selectedCriteria) {
                const aiScoreEntry = submission.AIscores.find(ai => ai.parameter === criteria.name);
                if (aiScoreEntry) {
                    const weightedScore = aiScoreEntry.score * criteria.weight; // Weight * AI Score
                    updatedScores.push({ parameter: criteria.name, score: weightedScore });
                }
            }

            // Update submission scores and recalculate total score
            submission.scores = updatedScores;
            submission.totalScore = updatedScores.reduce((sum, entry) => sum + entry.score, 0);
            await submission.save();
        }

        return res.status(200).json({
            message: "Selected criteria saved and submission scores updated successfully",
            selectedCriteria: hackathon.selectedCriteria
        });

    } catch (error) {
        console.error("Error saving selected criteria and updating scores:", error);
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
