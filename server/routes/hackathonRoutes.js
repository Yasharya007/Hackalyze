import express from "express";
import {getHackathonDetails,getHackathonSubmissions,getHackathonTeachers,getSubmissionDetails, addEvaluationCriteria, getAllCriteria, getSelectedEvaluationCriteria, updateSelectedCriteria} from "../controllers/hackathon.controller.js";

const router = express.Router();

// Get details of a specific hackathon
router.get("/:hackathonId", getHackathonDetails);

// Get all submissions of a hackathon
router.get("/:hackathonId/submissions", getHackathonSubmissions);

// Get all teachers assigned to a hackathon
router.get("/:hackathonId/teachers", getHackathonTeachers);

// Get details of a particular submission
router.get("/submission/:submissionId", getSubmissionDetails);

// Get top submissions
router.get("/:hackathonId/top-submissions", getTopSubmissions);

// Add parameters to judge the submissions
router.post("/:hackathonId/add-criteria", addEvaluationCriteria);

// Get criteria listed on which evaluation has been done
router.get("/:hackathonId/criteria", getEvaluationCriteria);

// Get only selected (ticked) criteria
router.get("/:hackathonId/selected-criteria", getSelectedEvaluationCriteria);

// Update selected criteria
router.put("/:hackathonId/selected-criteria", updateSelectedCriteria);

export default router;

