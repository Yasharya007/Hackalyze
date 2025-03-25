import express from "express";
import { 
    addParameter, 
    deleteParameter, 
    saveSelectedCriteria, 
    getSelectedCriteria,
    getAllParameters,
    shortlistStudents, 
    updateSubmission,
    getShortlistedStudents,
    getTeacherProfile,
    updateTeacherProfile
} from "../controllers/Teacher.controllers.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// Setting Parameters
router.post("/hackathons/:hackathonId/parameters", addParameter); // Add parameter to a hackathon
router.delete("/hackathons/:hackathonId/parameters/:parameterId", deleteParameter); // Delete a parameter
router.put("/hackathons/:hackathonId/selectedCriteria", saveSelectedCriteria); // Update selected criteria
router.get("/hackathons/:hackathonId/selectedCriteria", getSelectedCriteria); // Get selected criteria
router.get("/hackathons/:hackathonId/getParameters", getAllParameters); // Get all parameters for a hackathon

// Shortlisting Students
router.put("/hackathons/shortlist", shortlistStudents);
router.put("/hackathons/updateSubmission",updateSubmission)
router.get("/hackathons/:hackathonId/shortlisted", getShortlistedStudents);

// Teacher Profile
router.get("/profile/:teacherId", verifyUser, getTeacherProfile);
router.put("/update/:teacherId", verifyUser, updateTeacherProfile);

export default router;
