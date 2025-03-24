import express from "express";
import { submitHackathon,getSubmissionStatus } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/submit", verifyUser, upload.single("file"), submitHackathon);// swagger documented
router.post("/status",verifyUser,getSubmissionStatus)

/**
 * @swagger
 * /api/student/submit:
 *   post:
 *     summary: Submit hackathon entry
 *     description: Allows a student to submit a file for a hackathon.
 *     tags:
 *       - Student
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - hackathonId
 *               - fileType
 *               - file
 *             properties:
 *               hackathonId:
 *                 type: string
 *                 example: "661b4c2e4f1a2b3c4d5e6f7g"
 *               fileType:
 *                 type: string
 *                 enum: ["Audio", "Video", "File", "Image"]
 *                 example: "Video"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *     responses:
 *       200:
 *         description: Submission successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Submission successful"
 *                 submissionId:
 *                   type: string
 *                   example: "662c7f8a9b0c1d2e3f4g5h6i"
 *       400:
 *         description: Bad request (Missing hackathon ID, fileType, or file)
 *       401:
 *         description: Unauthorized (User must be logged in)
 *       500:
 *         description: Internal server error
 */

export default router;
