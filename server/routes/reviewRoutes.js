import express from "express";
import { moveToReviewFolder, getReviewSubmissions, removeFromReviewFolder } from "../controllers/reviewController.js";

const router = express.Router();

// Move a submission to review folder
router.put("/:submissionId/review", moveToReviewFolder);

// Get all submissions in the review folder
router.get("/review-folder", getReviewSubmissions);

// Remove submission from review folder
router.put("/:submissionId/remove-review", removeFromReviewFolder);

export default router;
