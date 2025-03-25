import express from "express";
import { 
    addParameter, 
    deleteParameter, 
    saveSelectedCriteria, 
    getSelectedCriteria, 
    shortlistStudents, 
    getShortlistedStudents 
} from "../controllers/Teacher.controllers.js";

const router = express.Router();

// Setting Parameters
router.post("/hackathons/:hackathonId/parameters", addParameter); // Add parameter to a hackathon
router.delete("/hackathons/:hackathonId/parameters/:parameterId", deleteParameter); // Delete a parameter
router.put("/hackathons/:hackathonId/selectedCriteria", saveSelectedCriteria); // Update selected criteria
router.get("/hackathons/:hackathonId/selectedCriteria", getSelectedCriteria); // Get selected criteria

// Shortlisting Students
router.put("/hackathons/shortlist", shortlistStudents);
router.get("/hackathons/:hackathonId/shortlisted", getShortlistedStudents);

export default router;
