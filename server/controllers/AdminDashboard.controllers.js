import { Submission } from "../models/Submission.models.js";
import { Hackathon } from "../models/Hackathon.model.js";
import { Student } from "../models/student.model.js";

export const getAdminDashboardStats = async (req, res) => {
    try {
        const totalHackathons = await Hackathon.countDocuments();
        const activeParticipants = await Student.countDocuments();
        const upcomingEvents = await Hackathon.countDocuments({ eventDate: { $gte: new Date() } });

        // Calculate Submission Rate
        const totalSubmissions = await Submission.countDocuments();
        const totalParticipants = await Student.countDocuments();
        const submissionRate = totalParticipants > 0 ? (totalSubmissions / totalParticipants) * 100 : 0;

        res.status(200).json({
            totalHackathons,
            activeParticipants,
            upcomingEvents,
            submissionRate: submissionRate.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
};
