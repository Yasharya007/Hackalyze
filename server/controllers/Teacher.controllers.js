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

            submission.scores.push({ parameter: name, score: aiScore });

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
            submission.AIscores = submission.AIscores.filter(entry => entry.parameter !== parameterName);
            
            // Recalculate totalScore
            submission.totalAIScore = submission.AIscores.reduce((sum, entry) => sum + entry.score, 0);

            submission.scores = submission.scores.filter(entry => entry.parameter !== parameterName);
            submission.totalScore = submission.scores.reduce((sum, entry) => sum + entry.score, 0);

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

/**
 * Evaluate submissions with custom parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with evaluation results
 */
export const evaluateWithParameters = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { submissionIds, parameters } = req.body;

    // Validate input
    if (!submissionIds || !submissionIds.length || !parameters || !parameters.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Submission IDs and parameters are required."
      });
    }

    // Validate parameters total weight equals 100%
    const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0);
    if (totalWeight !== 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Total weight of parameters must equal 100%." 
      });
    }

    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found." 
      });
    }

    // Find the submissions
    const submissions = await Submission.find({
      _id: { $in: submissionIds },
      hackathonId
    }).populate('studentId');

    if (submissions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No valid submissions found." 
      });
    }

    // Import evaluation service
    const evaluationService = (await import('../services/evaluationService.js')).default;

    // Evaluate each submission with custom parameters
    const results = [];
    for (const submission of submissions) {
      try {
        const evaluationResult = await evaluationService.evaluateSubmissionWithParameters(
          submission, 
          parameters, 
          hackathon.title
        );
        
        results.push({
          submissionId: submission._id,
          studentName: submission.studentId.name,
          scores: evaluationResult.scores,
          totalScore: evaluationResult.totalScore
        });
        
      } catch (evaluationError) {
        console.error(`Error evaluating submission ${submission._id}:`, evaluationError);
        results.push({
          submissionId: submission._id,
          studentName: submission.studentId?.name || 'Unknown',
          error: "Failed to evaluate this submission"
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Evaluation completed",
      results
    });
    
  } catch (error) {
    console.error("Error in evaluateWithParameters:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// Update parameter (weight, etc.)
export const updateParameter = async (req, res) => {
    try {
        const { hackathonId, parameterId } = req.params;
        const updateData = req.body;
        
        // Find the hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found." });
        }
        
        // Find and update the parameter
        const paramIndex = hackathon.parameters.findIndex(
            param => param._id.toString() === parameterId
        );
        
        if (paramIndex === -1) {
            return res.status(404).json({ message: "Parameter not found." });
        }
        
        // Update parameter fields
        Object.keys(updateData).forEach(key => {
            hackathon.parameters[paramIndex][key] = updateData[key];
        });
        
        await hackathon.save();
        
        res.status(200).json({ 
            message: "Parameter updated successfully.", 
            parameter: hackathon.parameters[paramIndex] 
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

// Get detailed shortlist for a hackathon
export const getShortlist = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        
        // Find shortlisted submissions for the hackathon
        const submissions = await Submission.find({
            hackathonId,
            status: "Shortlisted"
        })
        .populate('studentId', 'name email') // Populate student details
        .sort({ rank: 1 }); // Sort by rank if available
        
        if (!submissions || submissions.length === 0) {
            return res.status(200).json([]); // Return empty array if no shortlisted submissions
        }
        
        // Format response with student name and scores
        const formattedSubmissions = submissions.map(submission => {
            return {
                _id: submission._id,
                studentId: submission.studentId?._id,
                studentName: submission.studentId?.name || 'Unknown Student',
                title: submission.title,
                description: submission.description,
                githubRepo: submission.githubRepo,
                tags: submission.tags,
                hackathonId: submission.hackathonId,
                aiScore: submission.totalAIScore || 0,
                manualScore: submission.totalScore || 0,
                status: submission.status,
                rank: submission.rank || 999, // Default high rank if not set
                submittedAt: submission.createdAt,
                files: submission.files // Include files array in the response
            };
        });
        
        res.status(200).json(formattedSubmissions);
    } catch (error) {
        console.error("Error fetching shortlist:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

// Update the order of shortlisted submissions
export const updateShortlistOrder = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { submissions } = req.body; // Array of {submissionId, rank}
        
        if (!submissions || !Array.isArray(submissions)) {
            return res.status(400).json({ message: "Invalid data. Expected array of submissions with ranks." });
        }
        
        // Update each submission with its new rank
        const updatePromises = submissions.map(item => 
            Submission.findByIdAndUpdate(
                item.submissionId,
                { rank: item.rank },
                { new: true }
            )
        );
        
        const updatedSubmissions = await Promise.all(updatePromises);
        
        res.status(200).json({
            message: "Shortlist order updated successfully",
            updatedSubmissions
        });
    } catch (error) {
        console.error("Error updating shortlist order:", error);
        res.status(500).json({ message: "Failed to update shortlist order", error: error.message });
    }
};

// Send shortlisted submissions to admin for review
export const sendShortlistToAdmin = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        
        // Find the hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found." });
        }
        
        // Fetch all shortlisted submissions for this hackathon
        // Note: In the Submission model, studentId is used instead of submittedBy
        const shortlistedSubmissions = await Submission.find({ 
            hackathonId: hackathonId,
            status: "Shortlisted"
        }).sort({ rank: 1 }); // Sort by rank to maintain order
        
        console.log(`Found ${shortlistedSubmissions.length} shortlisted submissions for hackathon ${hackathonId}`);
        
        // Extract student IDs from the shortlisted submissions
        const shortlistedStudentIds = shortlistedSubmissions
            .map(submission => submission.studentId)
            .filter(Boolean); // Remove any null/undefined values
        
        // Update hackathon with the shortlisted students (even if empty)
        hackathon.shortlistedStudents = shortlistedStudentIds;
        
        // Update hackathon status to indicate shortlist sent to admin
        hackathon.shortlistSentToAdmin = true;
        hackathon.shortlistSentDate = new Date();
        
        await hackathon.save();
        
        // Here you would typically send a notification to admin
        // This could involve creating a notification in the database
        // or sending an email, etc.
        
        res.status(200).json({ 
            message: "Shortlist sent to admin for review successfully.",
            shortlistSentDate: hackathon.shortlistSentDate,
            shortlistedStudentsCount: shortlistedStudentIds.length
        });
    } catch (error) {
        console.error("Error sending shortlist to admin:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};
