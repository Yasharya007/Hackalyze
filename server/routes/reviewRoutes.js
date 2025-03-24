import express from "express";
import { markSubmissionAsReviewed, getReviewSubmissions, markSubmissionAsPending } from "../controllers/reviewController.js";

const router = express.Router();

// Move a submission to review folder
router.put("/:submissionId/review", markSubmissionAsReviewed);

// Get all submissions in the review folder
router.get("/review-folder", getReviewSubmissions);

// Remove submission from review folder
router.put("/:submissionId/remove-review", markSubmissionAsPending);

export default router;
