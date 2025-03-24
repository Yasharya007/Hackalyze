import { Hackathon } from "../models/Hackathon.model.js";

// Search Hackathons API
export const searchHackathons = async (req, res) => {
    try {
        const { query, startDate, endDate } = req.query; // Get search filters

        let searchCriteria = {};

        //  Search by Title or Description (case-insensitive)
        if (query) {
            searchCriteria.$or = [
                { title: { $regex: query, $options: "i" } }, // Partial match in title
                { description: { $regex: query, $options: "i" } } // Partial match in description
            ];
        }

        //  Filter by Start & End Date Range
        if (startDate || endDate) {
            searchCriteria.startDate = {};
            if (startDate) {
                searchCriteria.startDate.$gte = new Date(startDate); // Hackathons starting after this date
            }
            if (endDate) {
                searchCriteria.startDate.$lte = new Date(endDate); // Hackathons starting before this date
            }
        }

        // Fetch matching hackathons
        const hackathons = await Hackathon.find(searchCriteria)
            .sort({ startDate: 1 }) // Sort by upcoming hackathons first
            .lean(); // Convert to plain objects for efficiency

        res.status(200).json(hackathons);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
