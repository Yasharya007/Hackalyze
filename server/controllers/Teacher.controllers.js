import { Hackathon } from "../models/Hackathon.model.js";
import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/Teacher.model.js"; // Import Teacher model
import bcrypt from 'bcryptjs'; // Import bcryptjs (not bcrypt)

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

export const getAllParameters = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        // Find the hackathon and populate its parameters
        const hackathon = await Hackathon.findById(hackathonId).populate("parameters");

        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        return res.status(200).json({ parameters: hackathon.parameters });
    } catch (error) {
        console.error("Error fetching parameters:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Shortlist students 
export const shortlistStudents = async (req, res) => {
    try {
        const { submissionIds } = req.body; // Array of submission IDs

        if (!submissionIds || submissionIds.length === 0) {
            return res.status(400).json({ message: "No submissions selected for shortlisting" });
        }

        // Update the status of the selected submissions
        const updatedSubmissions = await Submission.updateMany(
            { _id: { $in: submissionIds } },
            { $set: { status: "Shortlisted" } }
        );

        return res.status(200).json({
            message: "Submissions successfully shortlisted",
            modifiedCount: updatedSubmissions.modifiedCount
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
        const submissions = await Submission.find({ 
            hackathonId, 
            isShortlisted: true 
        }).populate('studentId');
        
        res.status(200).json({
            message: "Shortlisted students retrieved successfully",
            shortlistedStudents: submissions.map(submission => ({
                submissionId: submission._id,
                studentId: submission.studentId._id,
                studentName: submission.studentId.name,
                email: submission.studentId.email,
                totalScore: submission.totalScore,
                AIScore: submission.totalAIScore
            }))
        });
    } catch (error) {
        console.error("Error getting shortlisted students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get teacher profile
export const getTeacherProfile = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // Verify the user ID from token matches requested ID for security
        if (req.user._id.toString() !== teacherId) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You can only view your own profile" 
            });
        }
        
        const teacher = await Teacher.findById(teacherId)
            .select('-password -refreshToken');  // Exclude sensitive fields
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                message: "Teacher not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Teacher profile retrieved successfully",
            data: teacher
        });
    } catch (error) {
        console.error("Error fetching teacher profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
};

// Update teacher profile
export const updateTeacherProfile = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const updates = req.body;
        
        // Verify the user ID from token matches requested ID for security
        if (req.user._id.toString() !== teacherId) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You can only update your own profile" 
            });
        }
        
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                message: "Teacher not found" 
            });
        }
        
        // Handle password update separately
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        
        // Update profile fields
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { $set: updates },
            { new: true }
        ).select('-password -refreshToken');
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedTeacher
        });
    } catch (error) {
        console.error("Error updating teacher profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update profile",
            error: error.message 
        });
    }
};

// Get students sorted by AI score (descending) for a particular teacher

export const getSortedByAIScore = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const submissions = await Submission.find({ teacherId }).sort({ AItotalScore: -1 });

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
        const submissions = await Submission.find({ teacherId });

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

export const updateSubmission = async (req, res) => {
    try {
        const { submissions } = req.body;

        if (!Array.isArray(submissions) || submissions.length === 0) {
            return res.status(400).json({ message: "Invalid input. Provide an array of submissions." });
        }

        // Prepare bulk update operations
        const bulkOperations = submissions.map(sub => ({
            updateOne: {
                filter: { _id: sub._id },
                update: { $set: { status: sub.status } }
            }
        }));

        // Execute bulkWrite to update multiple documents
        const result = await Submission.bulkWrite(bulkOperations);

        // Check if updates were applied
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No submissions were updated." });
        }

        return res.status(200).json({
            message: "Submissions updated successfully",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Error updating submissions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
