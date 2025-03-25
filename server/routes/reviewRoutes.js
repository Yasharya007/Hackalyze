import express from "express";
import { markSubmissionAsReviewed, getReviewedSubmissions, markSubmissionAsPending } from "../controllers/reviewController.js";

const router = express.Router();

// Move a submission to review folder
router.put("/:submissionId/review", markSubmissionAsReviewed);

// Get all submissions in the review folder
router.get("/review-folder", getReviewedSubmissions);

// Remove submission from review folder
router.put("/:submissionId/remove-review", markSubmissionAsPending);



export default router;
