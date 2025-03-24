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

// Shortlist students 
export const shortlistStudents = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { selectedStudents } = req.body; // Array of student IDs
        if (!selectedStudents || selectedStudents.length === 0) {
            return res.status(400).json({ message: "No students selected for shortlisting" });
        }
        // Find all submissions by selected students for this hackathon
        const submissions = await Submission.find({
            studentId: { $in: selectedStudents },
            hackathonId: hackathonId
        });
        
        if (submissions.length === 0) {
            return res.status(404).json({ message: "No submissions found for the selected students" });
        }

        let updatedSubmissions = [];

        for (const submission of submissions) {
            submission.status = "Shortlisted";
            await submission.save();
            updatedSubmissions.push(submission._id);
        }

        return res.status(200).json({
            message: "Students successfully shortlisted",
            updatedSubmissions
        });

    } catch (error) {
        console.error("Error in shortlistStudents:", error);
        res.status(500).json({ message: error.message });
    }
};


// Get all shortlisted students

export const getShortlistedStudents = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        // Find all submissions where status is "Shortlisted" for the given hackathon
        const shortlistedSubmissions = await Submission.find({
            hackathonId: hackathonId,
            status: "Shortlisted"
        }).select("studentId");

        if (shortlistedSubmissions.length === 0) {
            return res.status(404).json({ message: "No students have been shortlisted yet." });
        }

        // Extract student IDs from shortlisted submissions
        const studentIds = shortlistedSubmissions.map(sub => sub.studentId);

        // Fetch student details for the shortlisted students
        const shortlistedStudents = await Student.find({ _id: { $in: studentIds } })
            .select("name email mobileNumber schoolCollegeName grade state district");

        return res.status(200).json({ shortlistedStudents });

    } catch (error) {
        console.error("Error in getShortlistedStudents:", error);
        res.status(500).json({ message: error.message });
    }
};


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
