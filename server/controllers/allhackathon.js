import Hackathon from "../models/Hackathon.model.js";
import Student from "../models/student.model.js";

export const getHackathonsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params; // Get teacher ID from request

        // Find all hackathons where this teacher is assigned
        const hackathons = await Hackathon.find({ teachersAssigned: teacherId })
            .select("title description startDate endDate") // Get only necessary fields
            .lean();

        if (hackathons.length === 0) {
            return res.status(404).json({ message: "No hackathons assigned to this teacher." });
        }

        res.status(200).json(hackathons);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getStudentCountForTeacherHackathons = async (req, res) => {
    try {
        const { teacherId } = req.params; // Get teacher ID from request

        // Find all hackathons where this teacher is assigned
        const hackathons = await Hackathon.find({ teachersAssigned: teacherId })
            .select("_id title"); // Get hackathon IDs & titles

        if (hackathons.length === 0) {
            return res.status(404).json({ message: "No hackathons assigned to this teacher." });
        }

        // Count students for each hackathon
        const studentCounts = await Promise.all(
            hackathons.map(async (hackathon) => {
                const count = await Student.countDocuments({
                    "hackathonsParticipated.hackathon": hackathon._id
                });

                return {
                    hackathonId: hackathon._id,
                    title: hackathon.title,
                    studentCount: count
                };
            })
        );

        res.status(200).json(studentCounts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};