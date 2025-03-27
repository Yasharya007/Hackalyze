import { Hackathon } from "../models/Hackathon.model.js";
import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";
// Get details of a particular hackathon
export const getHackathonDetails = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId)
        .lean();
        if (hackathon.length === 0) {
            return res.status(404).json({ message: "No hackathons found." });
        }

        res.status(200).json(hackathon);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all submissions of a particular hackathon
export const getHackathonSubmissions = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const submissions = await Submission.find({ hackathonId })
            .populate("studentId", "name email") // Get student's name and email
            .sort({ submissionTime: -1 }) // Sort latest submissions first
            .lean();

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all teachers assigned to a particular hackathon
export const getHackathonTeachers = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId)
            .populate("teachersAssigned", "name email expertise")
            .lean();

        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        res.json(hackathon.teachersAssigned);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getHackathonStudents = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId)
            .populate("registeredStudents", "name email") // Populate students
            .lean();

        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        res.json(hackathon.registeredStudents); // Return the populated students

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getSubmissionDetails = async (req, res) => {
    try {
        const { submissionId } = req.params; // Extract submission ID from request
        // console.log("hello")
        const submission = await Submission.findById(submissionId)
            .populate("studentId", "name email mobileNumber schoolCollegeName grade gender state district") // Get student name & email
            .populate("hackathonId", "title") // Get hackathon title
            .populate("reviewerId", "name email") // Get reviewer (teacher) details
            .lean(); // Convert to plain JavaScript object

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        // console.log(submission)
        res.status(200).json({submission}); // Send full submission details
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// get top submissions


export const getTopSubmissions = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { topN } = req.query; // Number of top submissions

        if (!topN || isNaN(topN) || topN <= 0) {
            return res.status(400).json({ message: "Invalid number of submissions requested" });
        }

        const submissions = await Submission.find({ hackathonId })
            .populate("studentId", "name email") // Get student name & email
            .sort({ totalScore: -1 }) // Sort by AI score in descending order
            .limit(Number(topN)) // Limit the results to top N submissions
            .lean();

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
