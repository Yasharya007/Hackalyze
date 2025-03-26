import express from "express";
import { 
    addParameter, 
    deleteParameter, 
    saveSelectedCriteria, 
    getSelectedCriteria,
    getAllParameters,
    updateParameter,
    shortlistStudents, 
    updateSubmission,
    getShortlistedStudents,
    getTeacherProfile,
    updateTeacherProfile,
    evaluateWithParameters,
    getShortlist,
    updateShortlistOrder,
    sendShortlistToAdmin
} from "../controllers/Teacher.controllers.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// Setting Parameters
router.post("/hackathons/:hackathonId/parameters", addParameter); // Add parameter to a hackathon
router.delete("/hackathons/:hackathonId/parameters/:parameterId", deleteParameter); // Delete a parameter
router.patch("/hackathons/:hackathonId/parameters/:parameterId", updateParameter); // Update parameter weight
router.put("/hackathons/:hackathonId/selectedCriteria", saveSelectedCriteria); // Update selected criteria
router.get("/hackathons/:hackathonId/selectedCriteria", getSelectedCriteria); // Get selected criteria
router.get("/hackathons/:hackathonId/getParameters", getAllParameters); // Get all parameters for a hackathon

// AI Evaluation with custom parameters
router.post("/hackathons/:hackathonId/evaluate-with-parameters", evaluateWithParameters);

// Shortlisting Students
router.put("/hackathons/shortlist", shortlistStudents);
router.put("/hackathons/updateSubmission",updateSubmission)
router.get("/hackathons/:hackathonId/shortlisted", getShortlistedStudents);

// Shortlist Management
router.get("/hackathons/:hackathonId/shortlist", getShortlist); // Get detailed shortlist view
router.patch("/hackathons/:hackathonId/shortlist/order", updateShortlistOrder); // Update shortlist order
router.post("/hackathons/:hackathonId/shortlist/send-to-admin", sendShortlistToAdmin); // Send to admin

// Teacher Profile
router.get("/profile/:teacherId", verifyUser, getTeacherProfile);
router.put("/update/:teacherId", verifyUser, updateTeacherProfile);

export default router;
